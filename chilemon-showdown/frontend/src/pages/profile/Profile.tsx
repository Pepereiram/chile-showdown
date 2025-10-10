export default function Profile() {
  return (
    <div className="w-screen min-h-screen bg-white">
      {/* Contenedor a pantalla completa */}
      <div className="grid grid-cols-3 gap-6 p-6 w-full h-full">
        {/* Columna 1 */}
        <section className="h-full rounded-2xl bg-[#F0F1FF] shadow-sm border border-black/5 p-5 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">User Profile</h2>

          {/* contenido de ejemplo */}
          <div className="flex items-center gap-3">
            <img className="h-12 w-12 rounded-full object-cover" src="/avatar.jpg" alt="" />
            <div>
              <div className="font-medium">Ash Ketchum</div>
              <div className="text-sm text-black/60">Pallet Town</div>
            </div>
          </div>

          <button className="mt-4 self-start rounded-full px-3 py-1 text-sm bg-indigo-500 text-white shadow">
            Edit Profile
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/70 p-4 text-center shadow-sm"> 
              <div className="text-xl font-bold">420</div>
              <div className="text-xs text-black/60">Wins</div>
            </div>
            <div className="rounded-xl bg-white/70 p-4 text-center shadow-sm">
              <div className="text-xl font-bold">69</div>
              <div className="text-xs text-black/60">Losses</div>
            </div>
          </div>
        </section>

        {/* Columna 2 */}
        <section className="h-full rounded-2xl bg-[#F0F1FF] shadow-sm border border-black/5 p-5 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Player History</h2>

          <div className="space-y-3">
            {[
              { name: "Misty", city: "Cerulean City", rank: 1, img: "/misty.jpg" },
              { name: "Brock", city: "Pewter City", rank: 2, img: "/brock.jpg" },
              { name: "Erika", city: "Celadon City", rank: 3, img: "/erika.jpg" },
            ].map((p) => (
              <div key={p.rank} className="flex items-center justify-between rounded-xl bg-white/80 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <img className="h-10 w-10 rounded-full object-cover" src={p.img} alt="" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-black/60">{p.city}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold">Rank #{p.rank}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Columna 3 */}
        <section className="h-full rounded-2xl bg-[#F0F1FF] shadow-sm border border-black/5 p-5 flex flex-col">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold">Chilemon Battle</h2>
            <button className="rounded-full px-3 py-1 text-sm bg-indigo-500 text-white shadow">
              Start New
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-white/80 p-3 shadow-sm">
            <div className="text-sm text-black/70">Current Battle: Ash vs. Gary</div>
            <div className="mt-3 flex items-center gap-3">
              <img className="h-10 w-10 rounded-full object-cover" src="/pikachu.jpg" alt="" />
              <div className="flex-1">Pikachu</div>
              <button className="rounded-full px-3 py-1 text-sm bg-indigo-500 text-white shadow">
                Select Move
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
