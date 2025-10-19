// src/components/common/Modal.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
    DialogFooter} from "../ui/dialog"; // ajusta ruta
import { Button } from "../ui/button";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | string; // se puede mapear a clases
  footer?: React.ReactNode; // permite sobrescribir footer si se desea
  children?: React.ReactNode;
  className?: string;
};

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  footer,
  children,
  className = "",
}: ModalProps) {
  // mapa simple de tamaños a clases, ajústalo a tu UI
  const sizeClass =
    size === "sm"
      ? "max-w-lg"
      : size === "lg"
      ? "max-w-4xl"
      : size === "xl"
      ? "max-w-6xl"
      : "max-w-2xl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClass} ${className}`}>
        <DialogHeader>
          {title && <DialogTitle className="text-slate-800">{title}</DialogTitle>}
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">{children}</div>

        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
