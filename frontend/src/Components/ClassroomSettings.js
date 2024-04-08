import { useState } from "react"

const ClassroomSettings = () => {
    const [queueEnabled, setQueueEnabled] = useState()
    const [passwordEnabled, setPasswordEnabled] = useState()
    const handleSettingsChange = () => {
        const queueDesired = queueEnabled

    }
    return (<>
    <form onSubmit={handleSettingsChange}>
        <div>
            <label for="queue">Enable Queue</label>
            <input id="queue" type="checkbox" onChange={(e)=>{
                setQueueEnabled(e.target.checked)
                }
            }/>
        </div>
        <div>
            <label for="password-protected">Password protected room</label>
            <input id="password-protected" type="checkbox" onChange={(e)=>{
                setPasswordEnabled(e.target.checked)
                }
            } />
            {passwordEnabled === true && <div>
                Room Password:
                <input className="bg-slate-500" id="password" autoComplete="new-password" type="password" />
                </div>
            }
        </div>
    </form>
    
    </>)
}

export default ClassroomSettings