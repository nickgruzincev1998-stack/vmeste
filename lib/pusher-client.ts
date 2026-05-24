import PusherJS from "pusher-js";

export const pusherClient = typeof window !== "undefined"
  ? new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : (null as unknown as PusherJS);
