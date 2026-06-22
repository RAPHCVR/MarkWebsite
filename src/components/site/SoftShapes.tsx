export function SoftShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0))]" />
      <div className="absolute -right-40 top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-mark-100/30 blur-[120px]" />
      <div className="absolute bottom-[-14rem] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-mark-200/25 blur-[120px]" />
    </div>
  );
}
