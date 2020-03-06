export class DragDrop {
    constructor(selector, options) {
        this.options = {
            afterDrag() {},
            className : ''
        }
        Object.assign(this.options, options);
        this.container = document.querySelector(selector);
        this.dummy = null;
        this.el = null;
        this.bg = null;
    }

    initDraggable() {
        this.grabbableStyle();
        this.createDummy();

        this.container.classList.add("grabbable");

        for (const el of this.container.children){
            if (this.options.className !== "" && el.classList.contains(this.options.className)) {
                if(typeof el.draggabled == "undefined"){
                    if(el == this.dummy) continue;

                    el.draggable = true;

                    el.addEventListener("dragstart", this.dragOn.bind(this));
                    el.addEventListener("dragover", this.allowDrop.bind(this));
                    el.addEventListener("drag", this.drag.bind(this));
                    el.addEventListener("drop", this.drop.bind(this));

                    el.draggabled = true;
                }
            }
        }

        document.addEventListener("dragover", this.prevent.bind(this));
        document.addEventListener("drop", this.resetDrop.bind(this));
    }

    removeDraggable() {
        document.querySelector("#grabbableStyle").remove();
        this.dummy.remove();
        this.dummy = null;
        this.bg.remove();
        this.bg = null;

        this.container.classList.remove("grabbable");

        for (const el of this.container.children){
            if (this.options.className !== "" && el.classList.contains(this.options.className)) {
                if(typeof el.draggabled !== "undefined"){
                    if(el == this.dummy) continue;
                    el.draggable = false;

                    el.removeEventListener("dragstart", this.dragOn.bind(this));
                    el.removeEventListener("dragover", this.allowDrop.bind(this));
                    el.removeEventListener("drag", this.drag.bind(this));
                    el.removeEventListener("drop", this.drop.bind(this));
                    el.draggabled = false;
                }
            }
        }

        document.removeEventListener("dragover", this.prevent.bind(this));
        document.removeEventListener("drop", this.resetDrop.bind(this));
    }

    grabbableStyle(){
        const style = document.createElement("style");
        const elementsSelector = this.options.className !== "" ? `.${this.options.className}` : "*";
        style.id = "grabbableStyle";
        style.type = "text/css";
        style.innerHTML = `
            .grabbable > ${elementsSelector} {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                cursor: -webkit-grab;
                cursor: grab
            }
            .grabbable > .grabbable-dummy {
                border: 1px solid #d4d4d4;
                background: repeating-linear-gradient( -45deg, #fff, #fff 4px, #d4d4d4 4px, #d4d4d4 5px );
            }`;
        document.querySelector("body").appendChild(style);
    };

    callCallback(elem){
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("dragged", false, true);
        elem.dispatchEvent(evt);
        this.options.afterDrag(this.el);
    };

    createDummy(){
        this.bg = document.createElement("div");
        this.bg.style.position = "absolute";
        this.bg.style.width = "1px";
        this.bg.style.height = "1px";
        this.bg.style.overflow = "hidden";

        this.dummy = document.createElement("div");
        this.dummy.className = "grabbable-dummy";
        this.dummy.style.position = "relative";

        this.dummy.addEventListener("drop", e => {
            const data = e.dataTransfer.getData("text");
            if(data!="draggable") return;

            e.preventDefault();
            e.stopPropagation();

            while(this.bg.children.length > 0){
                const elem = this.bg.children[0];
                e.currentTarget.parentNode.insertBefore(elem, e.currentTarget);
            }

            this.dummy.style.display = "none";
            this.callCallback(this.dummy.parentNode);
        });

        document.body.appendChild(this.dummy);
        document.body.appendChild(this.bg);
    }

    updateDummy(el){
        this.bg.style.left = el.offsetLeft+"px";
        this.bg.style.top = el.offsetTop+"px";
        this.dummy.style.width = el.offsetWidth+"px";
        this.dummy.style.height = el.offsetHeight+"px";

        const style = window.getComputedStyle(el);
        this.dummy.style.display = style.display;
        this.dummy.style.margin = style.marginTop+" "+style.marginRight+" "+style.marginBottom+" "+style.marginLeft;
        this.dummy.style.padding = style.paddingTop+" "+style.paddingRight+" "+style.paddingBottom+" "+style.paddingLeft;
    }

    allowDrop(e){
        e.preventDefault();
        e.stopPropagation();

        if(e.target.previousElementSibling != this.dummy) {
            e.target.parentNode.insertBefore(this.dummy, e.target);
        } else {
            e.target.parentNode.insertBefore(this.dummy, e.target.nextElementSibling);
        }
    }

    drag(e) {
        if(e.currentTarget.parentElement == this.bg) return;
        if(e.currentTarget == this.dummy) return;

        this.updateDummy(e.currentTarget);
        e.currentTarget.parentNode.insertBefore(this.dummy, e.currentTarget);
        this.bg.appendChild(e.currentTarget);
    }

    drop() {
        e.preventDefault();
        e.stopPropagation();

        if(document.createEventObject) {
            this.dummy.fireEvent("ondrop", e);
        } else {
            this.dummy.dispatchEvent(new DragEvent(e.type, e));
        }
    }

    prevent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dragOn(e){
        this.el = e.target;
        e.dataTransfer.setData("text", "draggable");
    }

    resetDrop(e){
        const data = e.dataTransfer.getData("text");
        if(data!="draggable") return;

        e.preventDefault();
        e.stopPropagation();

        while (this.bg.children.length > 0) {
            const elem = this.bg.children[0];
            this.dummy.parentNode.insertBefore(elem, this.dummy);
        }

        this.dummy.style.display = "none";
        this.callCallback(this.dummy.parentNode);
    }
}


