interface ProgressProp {
    step: number;
}

export default function OnboardingProgress ({ step }: ProgressProp) {
    const widthPercentage = Math.min(100, Math.max(0, (step / 4) * 100));
    return (
        <>
        <section className="xui-my-1">
            <div className="xui-w-fluid-100 xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
                <span className="text-[12px] xui-opacity-5">Step {step} of 4</span>
                <span className="text-[13px] text-[#155DFC]">Skip for later</span>
            </div>
            <div className="qylon-progress-container">
                <div style={{width: `${widthPercentage}%`}} className={`qylon-progress-bar bg-[#030213]`}></div>
            </div>
        </section>
        </>
    );
}
