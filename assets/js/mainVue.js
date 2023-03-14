const { createApp } = Vue

createApp({
    data() {
        return {
            eventos:[],
            backupEventos:[],
            urlApi:"https://amazing-events.herokuapp.com/api/events",
            categorias:[],
            textoBuscar:"",
            categoriasBuscadas:[],
            evento:{},
            tabla1:[],
            tabla2:[],
            tabla3:[]
        }
    },
    created(){
        this.traerDatos()
    },
    mounted(){

    },
    methods: {
        traerDatos(){
            fetch(this.urlApi).then(response => response.json())
            .then(data => {
                if(document.title == "Amazing Events-Home"){
                    this.eventos = data.events
                    this.eventos.forEach(evento => {
                        if(!this.categorias.includes(evento.category)){
                            this.categorias.push(evento.category)
                        }
                    })
                    this.backupEventos=this.eventos
                }else if(document.title =="Amazing Events-Upcoming"){
                    this.eventos = data.events.filter(evento => evento.date > data.currentDate)
                    this.eventos.forEach(evento => {
                        if(!this.categorias.includes(evento.category)){
                            this.categorias.push(evento.category)
                        }
                    })
                    this.backupEventos=this.eventos
                }else if (document.title == "Amazing Events-Past Events"){
                    this.eventos = data.events.filter(evento => evento.date < data.currentDate)
                    this.eventos.forEach(evento => {
                        if(!this.categorias.includes(evento.category)){
                            this.categorias.push(evento.category)
                        }
                    })
                    this.backupEventos=this.eventos
                } else if(document.title == "Amazing Events-Detail"){
                    this.eventos = data.events
                    let idObtenido = new URLSearchParams(location.search).get("_id");
                    this.evento = this.eventos.find(events => events._id == idObtenido);
                }else if(document.title == "Amazing Events-Stats"){
                    this.eventos= data.events
                    let pastEvents = this.eventos.filter(evento => evento.date < data.currentDate)
                    let upcomingEvents = this.eventos.filter(evento => evento.date > data.currentDate)
                    this.tabla1=this.pintarTabla1(this.eventos,pastEvents)
                    this.tabla2=this.filtrarEventosPorCategoria(upcomingEvents)
                    this.tabla3=this.filtrarEventosPorCategoria(pastEvents)
                }
            
            })
        },
        pintarTabla1(todosEventos,eventosPasados){
            let eventoMayorCapacidad=todosEventos.sort((a,b)=>b.capacity-a.capacity)[0].name
            let eventosOrdenados = eventosPasados.sort((a, b) => {
                return (
                    (parseInt(b.assistance) * 100) / parseInt(b.capacity) -
                    (parseInt(a.assistance) * 100) / parseInt(a.capacity)
                )
            })
            let eventoMenorPorcentaje = eventosOrdenados[eventosOrdenados.length - 1].name
            let eventoMayorPorcentaje = eventosOrdenados[0].name
            return [eventoMayorPorcentaje,eventoMenorPorcentaje, eventoMayorCapacidad]
        },
        filtrarEventosPorCategoria(eventos){
            let categoriasFiltradas = this.filtrarCategorias(eventos)
            let revenues =[]
            let porcentajes=[]
            categoriasFiltradas.forEach(categoria =>{
                let eventosPorCategoria = eventos.filter(evento => evento.category == categoria)
                revenues.push((eventosPorCategoria.map(evento =>evento.price * (evento.assistance? evento.assistance : evento.estimate)).reduce((acum,element) => acum+element)).toLocaleString())
                porcentajes.push((eventosPorCategoria.map(evento =>(evento.assistance? evento.assistance / evento.capacity : evento.estimate /evento.capacity) *100).reduce((acum,element) => acum+element)/eventosPorCategoria.length).toFixed(2))
            })
            let array=[]
            categoriasFiltradas.forEach((categoria,i) =>{
                array.push({categoria: categoria,revenue:revenues[i],porcentaje: porcentajes[i]})
            })
            return array
        },
        filtrarCategorias(events){
            let arrayCategorias = []
            events.forEach(evento=>{
                if(!arrayCategorias.includes(evento.category)){
                    arrayCategorias.push(evento.category)
                }
            })
            return arrayCategorias
        }
        
    },
    computed: {
        superfiltro(){
            let filtro1 = this.backupEventos.filter(evento => evento.name.toLowerCase().includes(this.textoBuscar.toLowerCase()))
            let filtro2= filtro1.filter(evento => this.categoriasBuscadas.includes(evento.category))
            if(this.categoriasBuscadas.length >0 ){
                this.eventos=filtro2
            }else{
                this.eventos=filtro1
            }
        }
    }
}).mount('#app')