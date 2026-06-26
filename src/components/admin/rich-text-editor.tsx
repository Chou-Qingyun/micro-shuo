"use client";

import { useRef } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
  type LucideIcon,
} from "lucide-react";

type RichTextEditorProps = {
  name: string;
  label: string;
  initialValue: string;
};

type ToolbarButton = {
  title: string;
  icon: LucideIcon;
  isActive?: (editor: Editor) => boolean;
  action: (editor: Editor) => void;
};

const toolbarButtons: ToolbarButton[] = [
  {
    title: "一级标题",
    icon: Heading1,
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "二级标题",
    icon: Heading2,
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "三级标题",
    icon: Heading3,
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "加粗",
    icon: Bold,
    isActive: (editor) => editor.isActive("bold"),
    action: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    title: "斜体",
    icon: Italic,
    isActive: (editor) => editor.isActive("italic"),
    action: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    title: "下划线",
    icon: UnderlineIcon,
    isActive: (editor) => editor.isActive("underline"),
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    title: "无序列表",
    icon: List,
    isActive: (editor) => editor.isActive("bulletList"),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "有序列表",
    icon: ListOrdered,
    isActive: (editor) => editor.isActive("orderedList"),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "引用",
    icon: Quote,
    isActive: (editor) => editor.isActive("blockquote"),
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "撤销",
    icon: Undo2,
    action: (editor) => editor.chain().focus().undo().run(),
  },
  {
    title: "重做",
    icon: Redo2,
    action: (editor) => editor.chain().focus().redo().run(),
  },
  {
    title: "清除格式",
    icon: Eraser,
    action: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
  },
];

export function RichTextEditor({ name, label, initialValue }: RichTextEditorProps) {
  const hiddenFieldRef = useRef<HTMLTextAreaElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: "在这里输入章节正文，可设置标题、加粗、引用、列表和链接。",
      }),
    ],
    content: initialValue || "<p></p>",
    onUpdate: ({ editor: currentEditor }) => {
      if (hiddenFieldRef.current) {
        hiddenFieldRef.current.value = currentEditor.getHTML();
      }
    },
  });

  // 订阅编辑器状态，确保工具栏按钮激活态随光标位置和格式变化实时刷新。
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      buttonActive: toolbarButtons.map((button) =>
        ctx.editor ? (button.isActive?.(ctx.editor) ?? false) : false,
      ),
      isLink: ctx.editor?.isActive("link") ?? false,
    }),
  });

  function toggleLink() {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const rawUrl = window.prompt("请输入链接地址，例如：https://example.com", previousUrl ?? "");

    if (rawUrl === null) {
      return;
    }

    const trimmedUrl = rawUrl.trim();

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const url = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="grid gap-2 text-sm font-semibold text-[#3a303c]">
      <span>{label}</span>
      {/* 用隐藏字段复用现有 server action 的 FormData 字段名。 */}
      <textarea
        ref={hiddenFieldRef}
        name={name}
        defaultValue={initialValue}
        readOnly
        className="hidden"
        aria-hidden="true"
      />
      <div className="overflow-hidden rounded-[8px] border border-rose-100 bg-[#fffaf8] focus-within:border-[#c46b84]">
        <div className="flex flex-wrap gap-1 border-b border-rose-100 bg-white px-3 py-2">
          {toolbarButtons.map((button, index) => {
            const Icon = button.icon;
            const isActive = editorState?.buttonActive[index] ?? false;

            return (
              <button
                key={button.title}
                type="button"
                title={button.title}
                aria-label={button.title}
                aria-pressed={Boolean(isActive)}
                disabled={!editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor && button.action(editor)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-[8px] transition ${
                  isActive
                    ? "bg-[#f1e2dc] text-[#9b405e]"
                    : "text-[#5d5160] hover:bg-[#f8f1ee] hover:text-[#9b405e]"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <Icon size={17} aria-hidden={true} />
              </button>
            );
          })}
          <button
            type="button"
            title="插入链接"
            aria-label="插入链接"
            aria-pressed={Boolean(editorState?.isLink)}
            disabled={!editor}
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleLink}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-[8px] transition ${
              editorState?.isLink
                ? "bg-[#f1e2dc] text-[#9b405e]"
                : "text-[#5d5160] hover:bg-[#f8f1ee] hover:text-[#9b405e]"
            } disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <LinkIcon size={17} aria-hidden={true} />
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="admin-rich-editor px-4 py-3 font-normal leading-7 outline-none"
        />
      </div>
    </div>
  );
}
