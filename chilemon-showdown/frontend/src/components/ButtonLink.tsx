import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

interface ButtonLinkProps {
    route?: string;
    text: string;
    fullWidth?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ButtonLink = ({ route, text, fullWidth = false, onClick }: ButtonLinkProps) => {
    const navigate = useNavigate();

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        if (onClick) {
            onClick(e);
            return;
        }
        if (route) {
            navigate("/" + route);
        }
    };

    return (
        <Button variant="contained" fullWidth={fullWidth} onClick={handleClick}>
            {text}
        </Button>
    );
};

export default ButtonLink;