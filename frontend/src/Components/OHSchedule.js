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
        }
        return lookup[d]
    }
    const dates = props.dates
    return (<>  
        OH Schedule:
        {dates.map((d, index) =>  {
             return <h3 key={index}>{convertToName(d)}</h3>
        })}
        <h4>From {props.start} to {props.end}</h4>
    </>)
}


export default OHschedule