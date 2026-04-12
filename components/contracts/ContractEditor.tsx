'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { updateContractAction, generateContractSlugAction } from '@/lib/actions/contracts'
import { cn, SELECT_NONE, toSelectValue, fromSelectValue } from '@/lib/utils'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Copy, Save, Loader2,
} from 'lucide-react'
import type { Contract, Client, Project } from '@/types'

interface ContractEditorProps {
  contract: Contract
  clients: Client[]
  projects: Project[]
}

export function ContractEditor({ contract, clients, projects }: ContractEditorProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(contract.title ?? '')
  const [clientId, setClientId] = useState(contract.client_id ?? '')
  const [projectId, setProjectId] = useState(contract.project_id ?? '')
  const [status, setStatus] = useState(contract.status)
  const [slug, setSlug] = useState(contract.slug ?? '')
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSavedContent = useRef(contract.content ?? '')
  const lastSavedMeta = useRef({
    title: contract.title ?? '',
    clientId: contract.client_id ?? '',
    projectId: contract.project_id ?? '',
    status: contract.status,
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your contract...' }),
    ],
    content: contract.content ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
  })

  const saveContent = useCallback(async () => {
    if (!editor) return
    const content = editor.getHTML()
    const metaUnchanged =
      title === lastSavedMeta.current.title &&
      clientId === lastSavedMeta.current.clientId &&
      projectId === lastSavedMeta.current.projectId &&
      status === lastSavedMeta.current.status

    if (content === lastSavedContent.current && metaUnchanged) return

    setSaving(true)
    const result = await updateContractAction(contract.id, {
      title,
      content,
      client_id: clientId || undefined,
      project_id: projectId || undefined,
      status,
    })
    setSaving(false)

    if (result.error) {
      toast({ title: 'Save failed', description: result.error, variant: 'destructive' })
    } else {
      lastSavedContent.current = content
      lastSavedMeta.current = { title, clientId, projectId, status }
    }
  }, [editor, contract.id, title, clientId, projectId, status, toast])

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => { saveContent() }, 30000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [saveContent])

  async function handleManualSave() {
    if (!editor) return
    setSaving(true)
    const result = await updateContractAction(contract.id, {
      title,
      content: editor.getHTML(),
      client_id: clientId || undefined,
      project_id: projectId || undefined,
      status,
    })
    setSaving(false)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      lastSavedContent.current = editor.getHTML()
      lastSavedMeta.current = { title, clientId, projectId, status }
      toast({ title: 'Saved' })
    }
  }

  async function handleGenerateLink() {
    const result = await generateContractSlugAction(contract.id)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else if (result.data) {
      setSlug(result.data)
      const url = `${window.location.origin}/share/contract/${result.data}`
      navigator.clipboard.writeText(url)
      toast({ title: 'Link copied to clipboard' })
    }
  }

  if (!editor) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Editor */}
      <div className="space-y-0 rounded-lg border">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b p-2">
          <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} label="Bold" />
          <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} label="Italic" />
          <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={UnderlineIcon} label="Underline" />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} label="Heading 1" />
          <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} label="Heading 2" />
          <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} icon={Heading3} label="Heading 3" />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} label="Bullet List" />
          <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} label="Numbered List" />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={AlignLeft} label="Align Left" />
          <ToolbarButton active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={AlignCenter} label="Align Center" />
          <ToolbarButton active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={AlignRight} label="Align Right" />
        </div>
        <EditorContent editor={editor} />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contract title" />
          </div>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={toSelectValue(clientId)}
              onValueChange={(v) => setClientId(fromSelectValue(v))}
            >
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE}>No client</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={toSelectValue(projectId)}
              onValueChange={(v) => setProjectId(fromSelectValue(v))}
            >
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_NONE}>No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Contract['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <Button className="w-full" onClick={handleManualSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', active && 'bg-muted')}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
}
