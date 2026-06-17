export function SoftShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-[-14rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-mark-300/45 blur-3xl" />
      <div className="absolute right-[-16rem] top-24 h-[38rem] w-[38rem] rounded-full bg-mark-100/70 blur-3xl" />
      <div className="absolute bottom-[-18rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-mark-200/70 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,224,230,0.78),rgba(255,236,238,0))]" />
    </div>
  );
}
