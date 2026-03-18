import './onboarding-buttons.css';

function OnboardingButton({text, onClick}){
    return(
        <button   
            className="onboarding-button"
                onClick={onClick}
                >
            {text}
        </button>
    )
}
export default OnboardingButton;