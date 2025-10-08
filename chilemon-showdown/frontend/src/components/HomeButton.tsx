
interface HomeButtonProps {
    text: String;
    onClickFunction: () => void;
}

const HomeButton = ({ text, onClickFunction }: HomeButtonProps) => {
    return (
        <button
            className="btn"
            onClick={onClickFunction}>
            {text}
        </button>
    )
}



export default HomeButton;