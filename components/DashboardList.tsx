import Link from "next/link";

import { DashboardType, isQuizData } from "@/lib/types";
import { getDate } from "@/lib/utils";

const DashboardList = <K extends string>({ data, type }: DashboardType<K>) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full border-collapse table-auto">
        <thead>
          <tr className="border-b border-b-border text-tertiary-foreground">
            <th className="pr-4 font-medium pl-2 py-2 text-left min-w-5 w-[10%] ">
              No.
            </th>
            <th className="w-1/5 px-4 py-2 font-medium text-left whitespace-nowrap">
              Created at
            </th>
            <th className="w-2/5 px-6 py-2 font-medium min-w-[160px] text-left">
              Title
            </th>
            <th className="w-1/5 px-6 py-2 font-medium text-left">Status</th>
            {type === "quiz" ? (
              <th className="w-1/5 px-4 py-2 font-medium text-center">Score</th>
            ) : (
              <>
                <th className="w-2/5 px-4 py-2 font-medium text-left">
                  Content
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data?.reverse().map((item, index) => (
            <tr className="border-b border-b-border" key={item?._id}>
              <td className="text-tertiary-foreground font-medium pr-4 pl-2 py-4 min-w-5 w-[10%]">
                {index + 1}.
              </td>
              <td className="w-1/5 px-4 py-4">
                {getDate(item?._creationTime)}
              </td>
              <td className="w-2/5 px-6 py-4 min-w-[160px]">
                <Link
                  className="hover:underline"
                  href={`/${type}/${item?._id ?? ""}`}
                >
                  {isQuizData(item)
                    ? item.response?.title
                    : item.title ?? "Untitled"}
                </Link>
              </td>
              <td className="w-1/5 px-6 py-4 capitalize">{item.status}</td>
              {isQuizData(item) ? (
                <td className="w-1/5 px-4 py-4 text-center">
                  {item?.score ?? "-"}
                </td>
              ) : (
                <td className="w-2/5 px-4 py-4">
                  <Link
                    target="_blank"
                    className="transition-all text-secondary-foreground hover:text-foreground hover:underline"
                    href={item?.url}
                  >
                    {item?.url}
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardList;
