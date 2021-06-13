import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(RelativeTime);

export const timeAgo = (time: number) => {
	return dayjs(time).fromNow();
};

export const isDev = () => {
	return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
};
