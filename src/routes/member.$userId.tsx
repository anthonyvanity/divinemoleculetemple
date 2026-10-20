import { createFileRoute } from "@tanstack/react-router";
import { MemberView } from "@/components/member-view";

export const Route = createFileRoute("/member/$userId")({
  component: function MemberPage() {
    const { userId } = Route.useParams();
    return <MemberView userId={userId} />;
  },
});
