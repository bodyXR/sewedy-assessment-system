import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AlertDialogCustomProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function AlertDialogCustom({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default",
}: AlertDialogCustomProps) {
  const isDestructive = variant === "destructive";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${isDestructive ? "bg-red-100" : "bg-orange-100"}`}
            >
              <AlertCircle
                className={`h-5 w-5 ${isDestructive ? "text-red-600" : "text-orange-600"}`}
              />
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {onConfirm ? (
            <>
              <Button onClick={onClose} variant="outline">
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className={
                  isDestructive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-primary hover:bg-primary/90 text-white"
                }
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
