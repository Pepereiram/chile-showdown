
import { useNavigate } from "react-router-dom";

interface ButtonLinkProps {
    route: String;
    text: String;
}

const ButtonLink = ({ route, text}: ButtonLinkProps) => {
    const navigate = useNavigate();

    const basicStyle = "bg-blue-500 text-white font-medium hover:bg-blue-600 active:bg-blue-700 rounded-lg px-6 py-2 transition";
 
    return (
        <button
            className={basicStyle}
            onClick={() => navigate("/" + route)}>
            {text}
        </button>
    )
}



export default ButtonLink;