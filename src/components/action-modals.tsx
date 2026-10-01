"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Copy, Link, Zap } from "lucide-react";
import { Modal } from "./primitives";

export function NameModal({ title, label, initial = "", submitLabel, description, onSubmit, onClose, pending }: { title: string; label: string; initial?: string; submitLabel: string; description?: string; onSubmit: (name: string) => Promise<boolean>; onClose: () => void; pending: boolean }) {
  const [name, setName] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (submitting) return; setSubmitting(true); try { if (await onSubmit(name.trim())) onClose(); } finally { setSubmitting(false); } }
  return <Modal title={title} onClose={onClose}>{description && <p className="modal-description">{description}</p>}<form className="form-stack" onSubmit={submit}><label>{label}<input autoFocus required maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Make it a good one." /></label><div className="modal-actions"><button type="button" className="button outline" onClick={onClose}>Cancel</button><button className="button blue" disabled={pending || submitting}>{pending || submitting ? "Saving..." : submitLabel}{submitLabel.includes("race") ? <Zap size={17} /> : <ArrowRight size={17} />}</button></div></form></Modal>;
}

export function ConfirmModal({ title, description, onConfirm, onClose, pending }: { title: string; description: string; onConfirm: () => Promise<boolean>; onClose: () => void; pending: boolean }) {
  return <Modal title={title} onClose={onClose}><p className="modal-description">{description}</p><div className="modal-actions"><button className="button outline" onClick={onClose}>Keep it</button><button className="button danger" disabled={pending} onClick={async () => { if (await onConfirm()) onClose(); }}>{pending ? "Deleting..." : "Delete"}</button></div></Modal>;
}

export function ShareModal({ url, invite = false, onClose }: { url: string; invite?: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  return <Modal title={invite ? "Good things happen together." : "Pass it on."} onClose={onClose}><div className="share-symbol"><Link size={28} /></div><p className="modal-description">{invite ? "Anyone with this link can sign in and join your workspace. They can add, edit, and complete todos." : "Anyone with this link can view this todo and its linked notes. Changes to the todo stay up to date."}</p><label className="share-url">{invite ? "Workspace invitation" : "Your share link"}<input readOnly value={url} onFocus={event => event.target.select()} /></label><button className="button blue full" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setError("Select the link above and copy it."); } }}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copied. Spread the good stuff." : "Copy link"}</button>{error && <p className="form-error" role="alert">{error}</p>}</Modal>;
}
