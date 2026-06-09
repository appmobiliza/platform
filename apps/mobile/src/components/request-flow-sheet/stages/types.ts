import type { BottomSheetModal } from "@gorhom/bottom-sheet";

import type { Place, Stage } from "../types";

export interface StageBaseProps {
	modalRef: React.RefObject<BottomSheetModal | null>;
	handleDismiss: (stage: Stage) => void;
	isDark: boolean;
	origin: Place | null;
	destination: Place | null;
	dismissAndExit: () => void;
}
