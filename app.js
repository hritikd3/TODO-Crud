const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/node_crud", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todo list",
});

const item2 = new Item({
  name: "Add items using +",
});

const item3 = new Item({
  name: "You can also delete items",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Default items added successfully.");
            res.redirect("/");
          })
          .catch(function (err) {
            console.log(err);
          });
      } else {
        res.render("list", {
          listTitle: "Work List",
          newlistItems: foundItems,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Work List") {
    item
      .save()
      .then(function () {
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        if (foundList) {
          foundList.items.push(item);
          return foundList.save();
        } else {
          console.log("List does not exist");
          // Handle the scenario where the list does not exist
        }
      })
      .then(function () {
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
});

app.post("/delete", function (req, res) {
  const checkedId = req.body.checkbox;
const listName= req.body.listName;

if(listName=== "Today"){
    
}
  Item.findByIdAndDelete(checkedId)
    .then(function () {
      console.log("Successfully deleted checked item");
      res.redirect("/");
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        console.log("List does not exist");
        res.render("list", { listTitle: customListName, newlistItems: [] });
      } else {
        console.log("List exists");
        res.render("list", {
          listTitle: foundList.name,
          newlistItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.listen(5000, function () {
  console.log("Server started on port 5000");
});
