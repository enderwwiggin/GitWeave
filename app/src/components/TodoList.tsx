import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, CheckSquare, Square, ListTodo } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
}

const TODO_KEY = 'gitweave_todos';

function loadTodos(): TodoItem[] {
  try {
    const saved = localStorage.getItem(TODO_KEY);
    return saved ? (JSON.parse(saved) as TodoItem[]) : [];
  } catch {
    return [];
  }
}

// 团队共享待办事项：所有登录用户均可增删
export default function TodoList() {
  const { user } = useAuth();
  const [open, setOpen] = useState(true);
  const [todos, setTodos] = useState<TodoItem[]>(loadTodos);
  const [input, setInput] = useState('');

  useEffect(() => {
    try { localStorage.setItem(TODO_KEY, JSON.stringify(todos)); } catch { /* ignore */ }
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const item: TodoItem = {
      id: `td-${Date.now()}`,
      text,
      done: false,
      authorId: user?.id ?? '',
      authorName: user?.name ?? '匿名',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTodos((prev) => [item, ...prev]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const pending = todos.filter((t) => !t.done).length;

  return (
    <div className="border-t border-[#1f1f22] pt-3 mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs font-medium text-[#f4f4f5] mb-2 hover:text-[#10b981] transition-colors"
      >
        <span className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-[#10b981]" />
          待办事项
          {pending > 0 && (
            <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-full">
              {pending}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-[#969699]" /> : <ChevronDown className="w-4 h-4 text-[#969699]" />}
      </button>

      {open && (
        <div className="fade-in-up">
          {/* 添加输入框 —— 所有人可用 */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="添加待办事项..."
              className="flex-1 h-8 px-3 rounded bg-[#050507] border border-[#1f1f22] text-xs text-[#f4f4f5] placeholder-[#969699] focus:outline-none focus:border-[#10b981]/50"
            />
            <button
              onClick={addTodo}
              disabled={!input.trim()}
              className="flex items-center gap-1 px-3 h-8 rounded bg-[#10b981] hover:bg-[#10b981]/80 disabled:opacity-40 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />添加
            </button>
          </div>

          {/* 待办列表 */}
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
            {todos.length === 0 && (
              <p className="text-[10px] text-[#969699] text-center py-3">暂无待办，添加一条吧</p>
            )}
            {todos.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-2 px-2 py-1.5 rounded bg-[#050507] border border-[#1f1f22] hover:border-[#10b981]/30 transition-colors"
              >
                <button onClick={() => toggleTodo(t.id)} className="flex-shrink-0 text-[#969699] hover:text-[#10b981]">
                  {t.done ? <CheckSquare className="w-4 h-4 text-[#10b981]" /> : <Square className="w-4 h-4" />}
                </button>
                <span className={`flex-1 text-xs truncate ${t.done ? 'text-[#969699] line-through' : 'text-[#f4f4f5]'}`}>
                  {t.text}
                </span>
                <span className="text-[9px] text-[#969699] font-mono flex-shrink-0">{t.authorName}</span>
                <button
                  onClick={() => deleteTodo(t.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#969699] hover:text-[#d7244b] transition-all"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}