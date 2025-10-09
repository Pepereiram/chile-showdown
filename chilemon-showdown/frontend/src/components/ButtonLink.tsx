
import { useNavigate } from "react-router-dom";

interface ButtonLinkProps {
    route: String;
    text: String;
}

const ButtonLink = ({ route, text}: ButtonLinkProps) => {
    const navigate = useNavigate();

    const basicStyle = 'bg-red-500 text-black';
 
    return (
        <button
            className={basicStyle}
            onClick={() => navigate("/" + route)}>
            {text}
        </button>
    )
}



export default ButtonLink;