import List from "./List";

const Unmanaged = () => {
  return (
    <div className="pt-2">
      <div className="mx-5 mb-5">
        Accounts under your oversight but not under your management.
      </div>
      <div className="divider" />
      <div className="mx-5 my-3">
        <List />
      </div>
    </div>
  );
};

export default Unmanaged;
