import eggkingImg from "../../assets/HuevitoRey.jpeg";
import corxeaImg from "../../assets/corxea.jpg";
import misterionImg from "../../assets/misterion.jpg";
import papiMickeyImg from "../../assets/papimickey.jpg";
import vardokImg from "../../assets/vardok.jpg";
import xodaImg from "../../assets/xoda.jpg";

function CardScore({ score, tag }: { score: number; tag: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-4 text-center shadow-sm">
      <div className="text-xl font-bold">{score}</div>
      <div className="text-xs text-black/60">{tag}</div>
    </div>
  );
}
interface ColumnProps {
  title: string;
  children?: React.ReactNode;
}
function Column({ title, children }: ColumnProps) {
  return (
    <div className="h-full rounded-2xl bg-[#F0F1FF] shadow-sm border border-black/5 p-5 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function UserName() {
  return (
    <>
    <div className="flex items-center gap-3">
            <img className="h-12 w-12 rounded-full object-cover" src={papiMickeyImg} alt="" />
            <div>
              <div className="font-medium">Papi Mickey</div>
              <div className="text-sm text-black/60 text-left">Paine</div>
            </div>
    </div>
    </>
  );
}

function HistoryItem({ battle }: { battle: { name: string; result: string; img: string } }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/80 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <img className="h-10 w-10 rounded-full object-cover" src={battle.img} alt="" />
        <div>
          <div className="font-medium">{battle.name}</div>
          <div className="text-xs text-black/60">{new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <div className="text-sm font-semibold">{battle.result}</div>
    </div>
  );
}

function ActiveBattleItem() {
  return (
    <div className="mt-4 rounded-xl bg-white/80 p-3 shadow-sm">
      <div className="text-sm text-black/70">Current Battle: Ash vs. Gary</div>
      <div className="mt-3 flex items-center gap-3">
        <img className="h-10 w-10 rounded-full object-cover" src={xodaImg} alt="" />
        <div className="flex-1">Xodaa</div>
        <button className="rounded-full px-3 py-1 text-sm bg-indigo-500 text-white shadow">
          Select Move
        </button>
      </div>
    </div>
  );
}

function BattleHistory() {
  const battles = [
    { name: "Corxea", result: "Victory", img: corxeaImg },
    { name: "Misterion", result: "Defeat", img: misterionImg },
    { name: "Egg King", result: "Victory", img: eggkingImg },
    { name: "Vardok", result: "Defeat", img: vardokImg },
  ];

  return (
    <div className="space-y-3">
            {battles.map((battle) => (
              <HistoryItem key={battle.name} battle={battle} />
            ))}
    </div>
  );
}

export default function Profile() {
  
  return (<>
  
    <div className="w-screen min-h-screen bg-white">
      {/* Primera columna con los datos del usuario */}
      <div className="grid grid-cols-3 gap-6 p-6 w-full h-full">
        <Column title="User Profile">
        <UserName />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <CardScore score={120} tag="Wins" />
          <CardScore score={69} tag="Losses" />
        </div>
        </Column>

        <Column title="Player History">
          <BattleHistory />
        </Column>

        <Column title="Active Battle">
          <ActiveBattleItem />
        </Column>
      </div>
    </div>
    </>
  );
}
