"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import type { Person } from "@/lib/model";

export function Avatar({ person, size = "small" }: { person?: Person; size?: "small" | "large" }) {
  const initials = person?.name.split(" ").map(part => part[0]).slice(0, 2).join("") || "Y";
  const color = "blue";
  return <span className={`avatar ${size} ${color}`} title={person?.name ?? "You"}>{initials}</span>;
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const reference = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = reference.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={reference} className={`modal ${wide ? "wide" : ""}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-label={title}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={21} /></button></div>
    {children}
  </dialog>;
}

export function Star({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 100 100" className={className} aria-hidden="true"><path d="M50 0 59 29 79 10 75 36 100 32 82 50 100 65 73 65 80 91 59 74 49 100 40 73 18 91 23 64 0 66 19 49 0 32 28 35 21 9 41 28Z" fill="currentColor" /></svg>;
}

export function Logo() {
  return <Link href="/" className="brand" aria-label="Todo or Not Todo home"><span className="brand-mark">↗</span><span>TODO<span className="brand-sub"> / NOT TODO</span></span></Link>;
}
