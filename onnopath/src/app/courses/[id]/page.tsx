import { seedCourses } from "../../../data";
import Details from "../../../details";

export const generateStaticParams = () => [
  ...seedCourses.map((c) => ({ id: c.id })),
  { id: "studio" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Details id={id} />;
}

