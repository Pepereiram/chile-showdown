import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

interface ButtonLinkProps {
    route: string;
    text: string;
    fullWidth?: boolean;
}

const ButtonLink = ({ route, text, fullWidth = false }: ButtonLinkProps) => {
    const navigate = useNavigate();

    return (
        <Button
            variant="contained"
            fullWidth={fullWidth}
            onClick={() => navigate("/" + route)}
        >
            {text}
        </Button>
    );
};

export default ButtonLink;