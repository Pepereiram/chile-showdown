// src/components/ButtonNav.tsx
function ButtonNav({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <div className="mx-2">
      <button
        onClick={onClick}
        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        {name}
      </button>
    </div>
  );
}

export default ButtonNav;
