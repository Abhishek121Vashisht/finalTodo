//jshint esversion:6
// NODE_VERSION="18.12.1";
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.set('strictQuery',true);
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Abhinav121vashisht:0121DAv%3F%29@cluster0.zwhtp6r.mongodb.net/todolistDB').then(
  () => { 
     console.log("Connected to DB!");
 },
  err => { 
    console.log(err);
 }
);
// mongoose.connect("mongodb+srv://Abhinav121vashisht:0121DAv%3F%29@cluster0.zwhtp6r.mongodb.net/?retryWrites=true&w=majority/todolistDB",{useNewUrlParser:true});
const itemsSchema = new mongoose.Schema ({
	name: String
});
const Item = new mongoose.model ("Item", itemsSchema);
const Item1 = new Item ({
	name: "Apple",
});
const Item2 = new Item ({
	name: "Banana",
});
const Item3 = new Item ({
	name: "Mango",
});
const defaultItems=[Item1,Item2,Item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({},function(err,foundItems)
{
  if(foundItems.length===0)
  {
    Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Added");
  }
  });
  res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems}); 
  }
});
});

app.get("/:customListName",function(req,res)
{
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList){
        // create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
        console.log("exist");
      }
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const Item4 = new Item ({
    name: itemName
  });
  if(listName==="Today"){
    Item4.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(Item4);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete",function(req,res)
{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err)
  {
    if(err){
    console.log(err);
    }
    else{
      console.log("deleted");
      res.redirect("/");
    }
  });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3001, function() {
  console.log("Server started");
});