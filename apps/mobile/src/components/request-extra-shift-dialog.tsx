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

interface Props {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm?: () => void;
	onCancel?: () => void;
	isLoading?: boolean;
}

export function RequestExtraShiftDialog({
	open,
	onOpenChange,
	onConfirm,
	onCancel,
	isLoading,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Solicitação de turno extra</DialogTitle>
					<DialogDescription>
						Seu turno regular ainda não começou. Caso precise
						compensar horas pendentes, você pode iniciar um turno
						extra agora.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="ghost"
						onPress={onCancel}
						disabled={isLoading}
					>
						<Text>Cancelar</Text>
					</Button>
					<Button onPress={onConfirm} disabled={isLoading}>
						<Text>Iniciar turno extra</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
