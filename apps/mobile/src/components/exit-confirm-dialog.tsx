import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";

interface ExitConfirmDialogProps {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm?: () => void;
	onCancel?: () => void;
}

export function ExitConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
	onCancel,
}: ExitConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Você possui alterações não salvas</DialogTitle>
					<DialogDescription>
						Tem certeza de que deseja sair sem salvar suas
						alterações?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="ghost" onPress={onCancel}>
						<Text>Cancelar</Text>
					</Button>
					<Button onPress={onConfirm}>
						<Text>Sair sem salvar</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
