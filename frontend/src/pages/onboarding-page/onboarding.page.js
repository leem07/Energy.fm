import OnboardingQuestions from '../../components/Onboarding Questions/onboarding-questions.jsx';
function OnboardingPage(){
    return(
        <div className="min-h-screen  bg-[#0C1D1F] text-white" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
            <OnboardingQuestions/>
        </div>
    )
}

export default OnboardingPage;