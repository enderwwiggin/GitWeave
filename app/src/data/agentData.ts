import { teamMembers } from './mockData';
import type { AgentExperience } from '@/types';

export const agentExperiences: AgentExperience[] = [
  {
    id: 'ae1',
    title: 'ohMyPi vs Claude Code CLI：上下文消耗对比',
    summary: '同样的任务和skill组合，ohMyPi比Claude Code CLI节省30%-50%的上下文消耗，效率和质量媲美',
    content: `## 测试背景
最近在做机器人控制算法开发时，同时使用了ohMyPi和Claude Code CLI两个Agent框架，对比下来发现了一些关键差异。

## 核心发现

### 上下文消耗对比（相同任务：sEMG信号滤波模块开发）

| 指标 | ohMyPi | Claude Code CLI | 差异 |
|------|--------|-----------------|------|
| 总token消耗 | ~12K | ~24K | -50% |
| 有效上下文利用率 | 78% | 42% | +36% |
| 重复prompt次数 | 2 | 7 | -71% |
| 任务完成时间 | 15min | 22min | -32% |

### ohMyPi的优势

1. **Skill组合复用更高效**
   - ohMyPi的skill编排可以复用中间结果
   - 不需要每次都把完整的上下文传给LLM
   - 增量更新机制很聪明

2. **上下文压缩**
   - 自动过滤无关的历史消息
   - 保留关键决策点和代码变更
   - 避免了Claude Code CLI中常见的"上下文膨胀"

3. **多Agent协作**
   - 不同Agent可以共享skill执行结果
   - 不需要每个Agent都独立维护完整上下文

### Claude Code CLI的优势

1. **单任务深度更强**
   - 对于单个复杂文件的修改更细致
   - 代码理解深度更好

2. **IDE集成更成熟**
   - 与VS Code的集成更无缝
   - 实时预览和diff更清晰

## 结论

对于需要多skill组合、多步骤协作的复杂任务，ohMyPi的上下文管理明显更优。如果是单文件的深度重构，Claude Code CLI仍然有优势。

建议：两者结合使用——用ohMyPi做整体架构设计，用Claude Code CLI做代码细节优化。`,
    author: teamMembers[2], // 陈润峰
    tags: ['ohMyPi', 'ClaudeCodeCLI', '上下文优化', '对比'],
    likes: 12,
    likedBy: ['m2', 'm3', 'm4', 'm5'],
    comments: [
      {
        id: 'c1',
        author: teamMembers[4], // 武鸿旭
        content: '这个数据很有说服力！我们也准备试试ohMyPi',
        createdAt: '2026-06-29 14:30',
      },
      {
        id: 'c2',
        author: teamMembers[3], // 王一帆
        content: '上下文压缩这个功能很关键，Claude Code确实经常有膨胀问题',
        createdAt: '2026-06-29 16:00',
      },
    ],
    createdAt: '2026-06-28',
    updatedAt: '2026-06-30',
  },
  {
    id: 'ae2',
    title: 'GPT-4 vs Claude-3.5-Sonnet：代码理解力对比',
    summary: '在机器人控制代码开发中，两个模型的代码理解力、生成质量和上下文保持能力对比',
    content: `## 测试场景
用同样的prompt让两个模型处理以下任务：
1. 理解现有的ROS控制节点代码
2. 添加力矩补偿功能
3. 优化通信延迟

## 代码理解力

### GPT-4
- 能快速理解代码架构和依赖关系
- 对ROS消息类型的推断准确
- 但有时会"过度推断"，添加不必要的抽象层

### Claude-3.5-Sonnet
- 对代码细节把握更精准
- 修改建议更保守但更可靠
- 在理解复杂状态机时表现更好

## 代码生成质量

| 指标 | GPT-4 | Claude-3.5-Sonnet |
|------|-------|-------------------|
| 首次生成可编译率 | 72% | 85% |
| 类型安全 | 中等 | 高 |
| 注释质量 | 详细但啰嗦 | 简洁精准 |
| 边界处理 | 较弱 | 较强 |

## 上下文保持

长代码文件(>500行)处理时：
- GPT-4：后半段容易"遗忘"前面的设计决策
- Claude-3.5-Sonnet：上下文保持更稳定

## 推荐

- **架构设计**：GPT-4（思维更发散，方案更多样）
- **代码实现**：Claude-3.5-Sonnet（更可靠，bug更少）
- **调试修复**：Claude-3.5-Sonnet（定位问题更准确）`,
    author: teamMembers[5], // 肖文博
    tags: ['GPT-4', 'Claude', 'LLM对比', '代码理解'],
    likes: 9,
    likedBy: ['m1', 'm2', 'm6', 'm7'],
    comments: [
      {
        id: 'c3',
        author: teamMembers[7], // 刘世文
        content: 'Claude在类型安全方面确实更胜一筹',
        createdAt: '2026-06-27 10:15',
      },
    ],
    createdAt: '2026-06-26',
    updatedAt: '2026-06-30',
  },
  {
    id: 'ae3',
    title: 'Cursor + 本地LLM：离线开发方案',
    summary: '使用Ollama + CodeLlama在本地搭建离线AI编程环境，保护代码安全的同时保持高效',
    content: `## 方案架构

\`\`\`
Cursor IDE → Continue插件 → Ollama → CodeLlama-13B
\`\`\`

## 硬件配置
- MacBook Pro M3 Max (36GB)
- 外接SSD存储模型

## 模型选择对比

| 模型 | 参数 | 速度 | 代码质量 | 推荐度 |
|------|------|------|----------|--------|
| CodeLlama-7B | 7B | 快 | 一般 | ⭐⭐⭐ |
| CodeLlama-13B | 13B | 中等 | 好 | ⭐⭐⭐⭐ |
| DeepSeek-Coder-6.7B | 6.7B | 快 | 好 | ⭐⭐⭐⭐ |
| Qwen2.5-Coder-7B | 7B | 快 | 很好 | ⭐⭐⭐⭐⭐ |

## 实际体验

### Qwen2.5-Coder-7B（最推荐）
- 中文注释理解能力超强
- 代码补全准确率高
- 对Python/C++支持都很好
- 占用内存相对小

### 配置要点

\`\`\`json
// Continue配置
{
  "models": [{
    "title": "Qwen Coder Local",
    "provider": "ollama",
    "model": "qwen2.5-coder:7b"
  }]
}
\`\`\`

## 局限性
- 无法访问外部知识（最新API、库版本等）
- 复杂架构设计能力弱于云端大模型
- 需要定期更新模型`,
    author: teamMembers[8], // 张柯
    tags: ['Cursor', 'Ollama', '本地LLM', '离线开发'],
    likes: 15,
    likedBy: ['m1', 'm3', 'm4', 'm5', 'm6'],
    comments: [
      {
        id: 'c4',
        author: teamMembers[6], // 陈露佳
        content: 'Qwen2.5-Coder确实很强，中文理解能力吊打其他本地模型',
        createdAt: '2026-06-26 11:30',
      },
    ],
    createdAt: '2026-06-25',
    updatedAt: '2026-06-28',
  },
  {
    id: 'ae4',
    title: 'Agent框架选型指南：我们的团队实践',
    summary: '基于半年实践，总结不同场景下最适合的Agent框架选择策略',
    content: `## 我们的Agent工具箱

团队目前使用了以下工具，各有适用场景：

### 1. ohMyPi（推荐度：⭐⭐⭐⭐⭐）
**适用场景**：多步骤复杂任务、skill编排
**优势**：
- 上下文管理优秀
- 多Agent协作
- Skill复用机制

**劣势**：
- 学习曲线较陡
- 社区相对小

### 2. Claude Code CLI（推荐度：⭐⭐⭐⭐）
**适用场景**：单文件深度修改、快速原型
**优势**：
- IDE集成好
- 代码质量高
- 上手简单

**劣势**：
- 上下文消耗大
- 多文件协作弱

### 3. Cursor + GPT-4（推荐度：⭐⭐⭐⭐）
**适用场景**：日常开发、代码补全
**优势**：
- 体验流畅
- 实时补全强
- 代码库理解好

**劣势**：
- 订阅费用
- 代码安全顾虑

### 4. Aider（推荐度：⭐⭐⭐）
**适用场景**：Git集成开发、多文件修改
**优势**：
- Git操作集成好
- 支持多文件编辑

**劣势**：
- 交互体验一般
- 上下文管理一般

## 我们的最佳实践

1. **新项目启动**：ohMyPi做架构设计 → Cursor做开发
2. **Bug修复**：Claude Code CLI定位 → 手动修复
3. **代码重构**：Aider批量修改 → Claude Code优化细节
4. **日常编码**：Cursor自动补全 + 偶尔ohMyPi咨询`,
    author: teamMembers[7], // 刘世文
    tags: ['Agent框架', '选型', '最佳实践'],
    likes: 11,
    likedBy: ['m2', 'm3', 'm5', 'm8'],
    comments: [
      {
        id: 'c5',
        author: teamMembers[1], // 陈润峰
        content: '这个组合策略很实用，我们已经按这个流程跑了两个月了',
        createdAt: '2026-06-25 14:00',
      },
      {
        id: 'c6',
        author: teamMembers[4], // 武鸿旭
        content: 'Aider的Git集成确实好用，适合大规模重构',
        createdAt: '2026-06-25 16:30',
      },
    ],
    createdAt: '2026-06-24',
    updatedAt: '2026-06-29',
  },
  {
    id: 'ae5',
    title: 'Prompt Engineering：让LLM更懂机器人代码',
    summary: '针对机器人控制代码的特殊性，优化prompt以提升LLM的理解和生成质量',
    content: `## 机器人代码的特殊性

机器人控制代码与传统软件不同：
- 涉及实时性约束
- 物理量单位繁多
- 安全要求高
- 硬件耦合紧密

## Prompt优化技巧

### 1. 上下文前置
\`\`\`
你正在编写机器人控制代码。以下是项目背景：
- 机械臂：REBOT 6DOF
- 控制频率：100Hz
- 通信协议：ROS2
- 安全要求：力矩超限自动停机
\`\`\`

### 2. 结构化输出要求
\`\`\`
请按以下结构输出代码：
1. 函数签名（含类型注解）
2. 参数说明
3. 核心逻辑（带注释）
4. 安全检查点
5. 异常处理
\`\`\`

### 3. 物理量显式标注
\`\`\`
// 好的写法
joint_torque: float  # 单位：N·m，范围[0, 50]

// 差的写法
t = 30  # 这是什么单位？
\`\`\`

### 4. 安全约束强调
\`\`\`
重要：以下代码将直接控制物理机械臂。
必须包含：
- 力矩上限检查
- 关节限位检查
- 紧急停止响应
- 异常状态回退
\`\`\`

## 效果对比

优化prompt前后：
- 代码可编译率：45% → 82%
- 安全检查覆盖率：30% → 95%
- 注释完整度：20% → 88%`,
    author: teamMembers[3], // 王一帆
    tags: ['Prompt', 'LLM', '机器人', '最佳实践'],
    likes: 7,
    likedBy: ['m1', 'm5', 'm6'],
    comments: [
      {
        id: 'c7',
        author: teamMembers[6], // 陈露佳
        content: '物理量标注这个技巧太重要了，LLM经常搞混单位',
        createdAt: '2026-06-23 18:00',
      },
    ],
    createdAt: '2026-06-23',
    updatedAt: '2026-06-27',
  },
  {
    id: 'ae6',
    title: 'GitHub Copilot在嵌入式开发中的表现',
    summary: '在sEMG嵌入式固件开发中使用Copilot的实测体验',
    content: `## 使用环境
- VS Code + GitHub Copilot
- 目标平台：STM32H7
- 语言：C/C++

## 表现评估

### 擅长的
- 标准库函数补全（HAL库、CMSIS）
- 寄存器操作模板
- 中断处理框架
- DMA配置代码

### 不擅长的
- 硬件特定的时序控制
- 低功耗模式切换逻辑
- 传感器校准算法
- 实时性敏感代码

## 关键发现

Copilot对"模式化"代码很强，但对"领域知识密集"的代码较弱。

建议策略：
1. 让Copilot生成框架代码
2. 人工填充硬件特定逻辑
3. 用静态分析工具检查生成的代码
4. 在硬件上充分测试

## 一个实用技巧

用注释描述意图，让Copilot填空：
\`\`\`c
// 配置ADC1为12位分辨率，连续转换模式
// 采样时间：16.5个时钟周期
// 触发源：软件触发
// TODO: Copilot请补全配置代码
\`\`\``,
    author: teamMembers[6], // 陈露佳
    tags: ['GitHubCopilot', '嵌入式', 'STM32'],
    likes: 6,
    likedBy: ['m2', 'm4', 'm8'],
    comments: [],
    createdAt: '2026-06-22',
    updatedAt: '2026-06-25',
  },
];

export const agentTags = [
  'ohMyPi',
  'ClaudeCodeCLI',
  '上下文优化',
  '对比',
  'GPT-4',
  'Claude',
  'LLM对比',
  '代码理解',
  'Cursor',
  'Ollama',
  '本地LLM',
  '离线开发',
  'Agent框架',
  '选型',
  '最佳实践',
  'Prompt',
  'LLM',
  '机器人',
  'GitHubCopilot',
  '嵌入式',
  'STM32',
];
