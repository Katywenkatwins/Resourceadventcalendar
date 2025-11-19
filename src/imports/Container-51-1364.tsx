import svgPaths from "./svg-btiev8urhr";

function Icon() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          <path d={svgPaths.p4e0cf00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[416px] size-[64px] top-[48px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute font-['Arial:Bold_Italic',sans-serif] h-[97.5px] italic leading-[48.75px] left-[48px] text-[30px] text-center text-nowrap text-white top-[136px] w-[800px] whitespace-pre" data-name="Paragraph">
      <p className="absolute left-[400.2px] top-[-4px] translate-x-[-50%]">{`"Ми створили цей календар, щоб нагадати кожному:`}</p>
      <p className="absolute left-[400.09px] top-[44.75px] translate-x-[-50%]">{`новорічне диво — це ти."`}</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[28px] left-[48px] opacity-90 top-[257.5px] w-[800px]" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[28px] left-[400.34px] not-italic text-[20px] text-center text-nowrap text-white top-[-2.5px] translate-x-[-50%] whitespace-pre">— Катерина Сміян, авторка проєкту</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[267.943px] relative w-[236.461px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 237 268">
        <g id="Frame 48097520" opacity="0.2">
          <path d={svgPaths.p135dc200} fill="var(--fill-0, #CF3C32)" id="Vector" />
          <path d={svgPaths.p643d200} fill="var(--fill-0, #EFEAE6)" id="Vector_2" />
          <path d={svgPaths.p3429f380} fill="var(--fill-0, #F0ECE8)" id="Vector_3" />
          <path d={svgPaths.p21bea400} fill="var(--fill-0, #EFE9E6)" id="Vector_4" />
          <path d={svgPaths.p1141b540} fill="var(--fill-0, #EEE7E4)" id="Vector_5" />
          <path d={svgPaths.p25303700} fill="var(--fill-0, #EFE9E6)" id="Vector_6" />
          <path d={svgPaths.p32ac0680} fill="var(--fill-0, #F0EBE7)" id="Vector_7" />
        </g>
      </svg>
    </div>
  );
}

export default function Container1() {
  return (
    <div className="overflow-clip relative rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <Container />
      <Paragraph />
      <Paragraph1 />
      <div className="absolute flex h-[267.943px] items-center justify-center left-[705.5px] top-[156.5px] w-[236.461px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <Frame />
        </div>
      </div>
    </div>
  );
}