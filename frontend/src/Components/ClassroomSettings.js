import { useState } from "react"
import { setClassroomSettings } from "../UserUtils"

const ClassroomSettings = () => {
    const [queueEnabled, setQueueEnabled] = useState(false)
    const [passwordEnabled, setPasswordEnabled] = useState(false)
    const [password, setPassword] = useState("")
    const handleSettingsChange = (e) => {
        e.preventDefault()
        const newSettings = {
            queueEnabled: queueEnabled,
            passwordEnabled: passwordEnabled,
            password: passwordEnabled === true ? password : undefined
        }
        setClassroomSettings(newSettings).then(result => {
            console.log(result)
        })
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
            <label htmlFor="password-protected">Password protected room</label>
            <input id="password-protected" type="checkbox" onChange={(e)=>{
                setPasswordEnabled(e.target.checked)
                }
            } />
            {passwordEnabled === true && <div>
                Room Password:
                <input className="bg-slate-500" id="password" autoComplete="new-password" type="password" onChange={(e)=>setPassword(e.target.value)}/>
                </div>
            }
        </div>
        <input type="submit" />
    </form>
    
    </>)
}

export default ClassroomSettings