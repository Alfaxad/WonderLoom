import { Storybook } from "@/components/storybook";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Storybook sessionId={id} />;
}
