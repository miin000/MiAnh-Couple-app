import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <LoadingState
      compact
      title="Đang mở trang"
      description="Chờ một chút nhé"
    />
  );
}
