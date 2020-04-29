//var db = require('../db')
var db = require('../dbQueries/dbFunctions')
var users = require('../models/usersdata');
var orders = require('../models/orderdata');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({ userId: 'number', name: 'string'});
var new_User_schema = new mongoose.Schema({ userId: 'number', name: 'string', noOfOrders:'number'});
var orderSchema = new mongoose.Schema({ orderId:'number',userId: 'number', subtotal:'number', date: 'date'});
var usersModel = mongoose.model('user_data', new_User_schema);
var orderModel = mongoose.model('orders', orderSchema);

//var newUsersModel = mongoose.model('user_data', new_User_schema);

var billAggr = usersModel.aggregate([
    {
        $lookup:{
            from:"orders",
            localField:"userId",
            foreignField:"userId",
            as:"orders"
        }
    }]);

module.exports = function(app){
    console.log("services");
    //console.log(users);
    var addNewUsers = function(cb){
        var userLength = users.length;
        users.map(function(v,i){
            var tempUser = new usersModel(v);
            tempUser.save(function (err,res) {
                if (err){
                    return cb(err)
                }
               else{
                    userLength--
                    if(userLength==0){
                        console.log("User Saved");
                        cb(null,"Users Added Successfully")
                    }
                }
            });
        });
    }    
    var addNewOrders = function(cb){
        var orderLength = orders.length;
        orders.map(function(val,i){
            var tempOrder = new orderModel(val);
            tempOrder.save(function (err,res) {
                if (err){
                    return cb(err)
                }
               else{
                    orderLength--
                    if(orderLength==0){
                        console.log("Orders Saved");
                        cb(null,"Orders Added Successfully")
                    }
                }
            });
        });

    }
    function checkUsers(req,res,next){
        usersModel.find(function(err,result){
            if(!result || result.length>0){
                res.send("Users Alredy Added");
            }
            else{
                next();
            }
        })
    }
    function checkOrders(req,res,next){
        orderModel.find(function(err,result){
            if(!result || result.length>0){
                res.send("Orders Alredy Added");
            }
            else{
                next();
            }
        })
    }
    app.use('/addNewUsers',[checkUsers],function(req,res){
        addNewUsers(function(err,result){
            if(err) res.send(err);
            res.send(result);
        });
    });
    
    app.use('/addNewOrders',[checkOrders],function(req,res){
        addNewOrders(function(err,result){
            if(err) res.send(err);
            res.send(result);
        });
    });


    app.use('/getBill',function(req,res){
        billAggr.exec(function(err,result){
            if(result && result.length>0){
                var data = [];
                result.map(function(val,ind){
                    var tempObj = {
                        "userId":val.userId,
                        "name":val.name,
                        "noOfOrders":val.orders.length,
                        "averageBillValue":calculateAverage(val.orders),
                    }
                    data.push(tempObj);
                });
                res.send(data);
            }
            else{
                res.send("No Data Found");
            }
        })
    });


    function updateData(req,res,next){
        billAggr.exec(function(err,result){
            if(result && result.length>0){
                var resultLength = result.length;
                result.map(function(val,ind){
                    usersModel.updateOne({userId:val.userId},{"noOfOrders":val.orders.length},function(error,succ){
                        if(err){
                            res.send(error);
                        }
                        else{
                            resultLength--;
                            if(resultLength==0){
                                next();
                            }
                        }
                    })
                });
            }
            else{
                res.send("No Data Found");
            }
        })
    } 
    app.use('/updateUsersData',[updateData],function(req,res){
        res.send({success: true, message : "Successfully updated"});
    });

    function calculateAverage(data){
        var result = data.reduce(function(acc,cur){
            acc.sum = acc.sum + cur.subtotal,
            acc.counts++;
            return acc;
        },{sum:0,counts:0});
        var average = parseInt(result.sum/result.counts);
        return average;
    }
    //app.addNewUsers();
    //app
}