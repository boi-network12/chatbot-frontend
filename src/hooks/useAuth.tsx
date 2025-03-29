import AuthContext from "@/context/authContext";
import { useContext } from "react";

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error(" useAuth must be used within an Attribute Provider")
    }
    return context;
}

export default useAuth;