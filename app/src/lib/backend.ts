import type { FileVersion, Project } from '@/types';

// 后端代理（Cloudflare Worker）客户端
// 令牌在 Worker 服务端。写入需带登录账号密码，Worker 校验是否管理员。

const URL_KEY = 'gitweave_backend_url';

// 已部署的团队后端地址（员工无需配置即可读取）。为空则回退 localStorage 演示模式。
// 生产环境用 BAKED_BACKEND_URL；测试镜像可通过 VITE_BACKEND_URL 环境变量覆盖。
const BAKED_BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'https://gitweave-backend.2429910092.workers.dev';

export function backendUrl(): string {
  const v = (localStorage.getItem(URL_KEY) || BAKED_BACKEND_URL).trim();
  return v.replace(/\/+$/, '');
}

export interface AuthCreds {
  name: string;
  password: string;
}

function authHeaders(creds: AuthCreds): Record<string, string> {
  return {
    'X-Auth-User': encodeURIComponent(creds.name),
    'X-Auth-Pass': encodeURIComponent(creds.password),
  };
}

export async function fetchCommits(): Promise<FileVersion[]> {
  const res = await fetch(`${backendUrl()}/api/commits`);
  if (!res.ok) throw new Error(`读取提交失败: ${res.status}`);
  const data = await res.json();
  return (data.commits as FileVersion[]) ?? [];
}

export interface AttachmentPayload {
  name: string;
  size: string;
  contentBase64: string;
}

// 整个项目文件夹中的单个文件（不编码，直接存 File 引用）
export interface FolderFilePayload {
  relativePath: string;
  size: string;
  file: File;
}

// 计算项目下一个版本号（与 Worker 逻辑一致）
function nextProjectVersion(commits: FileVersion[], projectId: string): string {
  const versions = commits
    .filter((c) => c.projectId === projectId)
    .map((c) => {
      const m = String(c.version || '').match(/v0\.0\.(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
  const max = versions.length ? Math.max(...versions) : 0;
  return `v0.0.${max + 1}`;
}

export async function createCommit(
  commit: FileVersion,
  creds: AuthCreds,
  files?: FolderFilePayload[],
  existingCommits?: FileVersion[],
): Promise<FileVersion> {
  // 先算版本号，逐文件上传到 R2（避免大请求体超 Worker CPU 限制）
  const version = nextProjectVersion(existingCommits ?? [], commit.projectId);
  const projectName = commit.projectName || commit.projectId;
  const folderName = commit.filename || 'unknown';

  const uploadedFiles: { relativePath: string; size: string }[] = [];
  if (files && files.length > 0) {
    // 并发上传二进制直传（无 base64 开销）
    const CONCURRENCY = 8;
    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const batch = files.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(async (f) => {
        const q = new URLSearchParams({ projectName, folderName, version, relativePath: f.relativePath });
        const res = await fetch(`${backendUrl()}/api/upload?${q}`, {
          method: 'POST',
          headers: authHeaders(creds),
          body: await f.file.arrayBuffer(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `文件上传失败: ${res.status}`);
        return { relativePath: f.relativePath, size: f.size } satisfies { relativePath: string; size: string };
      }));
      uploadedFiles.push(...results);
    }
  }

  // 提交元数据（文件已上传，只传路径/大小）
  const res = await fetch(`${backendUrl()}/api/commits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(creds) },
    body: JSON.stringify({ commit, files: uploadedFiles }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `提交失败: ${res.status}`);
  return data.commit as FileVersion;
}

export async function deleteCommit(id: string, creds: AuthCreds): Promise<void> {
  const res = await fetch(`${backendUrl()}/api/commits/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(creds),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `删除失败: ${res.status}`);
  }
}

// ===== 项目（覆盖层：added 新增 + removedIds 移除的预置项目）=====
export interface ProjectOverrides {
  added: Project[];
  removedIds: string[];
}

export async function fetchProjectOverrides(): Promise<ProjectOverrides> {
  const res = await fetch(`${backendUrl()}/api/projects`);
  if (!res.ok) throw new Error(`读取项目失败: ${res.status}`);
  const data = await res.json();
  return { added: (data.added as Project[]) ?? [], removedIds: (data.removedIds as string[]) ?? [] };
}

export async function addProject(project: Project, creds: AuthCreds): Promise<Project> {
  const res = await fetch(`${backendUrl()}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(creds) },
    body: JSON.stringify({ project }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `新建项目失败: ${res.status}`);
  return data.project as Project;
}

export async function removeProject(id: string, creds: AuthCreds): Promise<void> {
  const res = await fetch(`${backendUrl()}/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(creds),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `移除项目失败: ${res.status}`);
  }
}

// 压缩文件扩展名（禁止上传）
export const COMPRESSED_EXTS = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.tgz', '.tar.gz', '.tar.bz2', '.cab', '.iso', '.lz', '.lzma', '.z'];

export function isCompressedFile(name: string): boolean {
  const lower = name.toLowerCase();
  return COMPRESSED_EXTS.some((ext) => lower.endsWith(ext));
}

// 读取整个文件夹（webkitdirectory 选择）为 FolderFilePayload 数组
// 返回 { files, error }：若含压缩文件则返回 error，files 为空
export async function readFolderFiles(fileList: FileList | File[]): Promise<{ files: FolderFilePayload[]; error?: string }> {
  const arr = Array.from(fileList);
  const files = arr.map((f) => {
    const rel = (f.webkitRelativePath || f.name).split('/').slice(1).join('/') || f.name;
    return {
      relativePath: rel,
      size: `${Math.max(1, Math.round(f.size / 1024))}KB`,
      file: f,
    } satisfies FolderFilePayload;
  });
  return { files };
}