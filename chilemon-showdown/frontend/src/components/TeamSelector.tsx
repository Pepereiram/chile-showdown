import { CiCirclePlus } from "react-icons/ci";




function ImageCircle({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="relative w-16 h-16">
            <img
                src={src}
                alt={alt}
                className="rounded-full object-cover w-full h-full"
            />
        </div>
    );
}


interface OptionImgProps {
    text: string;
}
function OptionImg({ text }: OptionImgProps) {
    const team = [
        {dir: "./assets/corxea.jpg"},
        {dir: "./assets/HuevitoRey.jpeg"},
        {dir: "./assets/misterion.jpg"},
        {dir: "./assets/papimickey.jpg"},
    ];
    return (
        <option>
            {text}
        </option>
    );
}

interface TeamSelectorProps {
  teams: Array<{id: number, name: string, members: string[]}>;
}

function TeamSelector () {
    const teams = ["Equipo 1", "Equipo 2", "Equipo 3"]; // Debe mostrar al team
    const hasTeam = true;
    return (
    <div className=""
        >
            <h3>Selecciona un equipo</h3>
            { !hasTeam && <div className="flex items-center justify-center">
                <a href="/team-builder">
                    <CiCirclePlus
                    className="icon-24 self-center size-8 hover:scale-110 transition"/>
                </a>
            </div>}
            { hasTeam && 
            <select>
                {teams.map((team, index) => {
                    return (
                        <OptionImg text={team} />
                    );
                })}
            </select>}
        </div>
    );
};


export default TeamSelector;