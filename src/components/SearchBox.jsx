export default function SearchBox({
  value,
  onChange
}) {

  return (

    <input
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder="Search Channels"
      style={{
        width: "100%",
        padding: "15px",
        fontSize: "20px",
        marginBottom: "20px",
        borderRadius: "10px"
      }}
    />

  );
}