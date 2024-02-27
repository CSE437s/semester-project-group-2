const OHschedule = (props) => {
    const convertToName = (d) => {
        const lookup = {
            "S": "Saturdays",
            "Su": "Sundays",
            "M": "Mondays",
            "T": "Tuesdays",  
            "W": "Wednesdays",
            "Th": "Thursdays",
            "F": "Fridays"
        };
        return lookup[d];
    };

    const dates = props.dates;

    return (
        <div className="flex flex-col items-center justify-center bg-indigo-200 rounded-lg shadow-md p-6 mb-4 mt-4">
            <h2 className="text-lg font-bold mb-2">OH Schedule:</h2>
            <div className="flex flex-wrap mb-2 justify-center">
                {dates.map((d, index) => (
                    <div key={index} className="bg-indigo-500 text-white font-bold py-1 px-2 rounded mr-2 mb-2">{convertToName(d)}</div>
                ))}
            </div>
            <h3 className="text-base">From {props.start} {props.start.endsWith("AM") || props.start.endsWith("PM") ? "" : "AM"} to {props.end} {props.end.endsWith("AM") || props.end.endsWith("PM") ? "" : "PM"}</h3>
        </div>
    );
};

export default OHschedule;
