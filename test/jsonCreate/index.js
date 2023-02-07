addEventListener("load", () => {
    const main = document.getElementById("main")
    const json = {
        "data": "ma"
    }
    function jsonToGUI(json) {
        const toString = Object.prototype.toString
        console.log(toString.call(json), toString.call(json) == "[object String]")
        let dest = json 
        let list
        let types = false
        function prototype(json) {
            const string = Object.prototype.toString.call(json)
            if (string === "[object Object]") return "Object"
            if (string === "[object Array]") return "Array"
            if (string === "[object String]") return "String"
            if (string === "[object Object]") return "Number"
            if (string === "[object Object]") return "Boolean"
            return null
        }
        while (types) {
            const type = prototype(json)
            if (type === "Object") list = Object.keys(json)
        }
        
        function addNestedProperties(mlist, mdest, write) {
            let dest = json
            let list = JSON.parse(JSON.stringify(mlist))
            while (list.length !== 0) {
                if (!(list[0] in dest)) dest[list[0]] = {}
                dest = dest[list[0]]
                list = list.slice(1)
            }
            if (write) dest[write.name] = write.data
        }
    }
    jsonToGUI(json)
})