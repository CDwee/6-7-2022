// Started at 10:56 6-7-2022

include ../mixins/mixins

<!DOCTYPE html>
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        title #{pageTitle}
        link(rel='stylesheet', href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css', integrity='sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh', crossorigin='anonymous')
        link(rel="stylesheet", href="/css/main.css")
    body
        script.
            var userLoggedIn = !{userLoggedInJs};
        .wrapper
            .row
                nav.col-2
                    a.blue(href="/")
                        i.fas.fa-dove
                    a(href="/")
                        i.fas.fa-home
                    a(href="/search")
                        i.fas.fa-search
                    a(href="/notifications")
                        i.fas.fa-bell
                    a(href="/messages")
                        i.fas.fa-envelope
                    a(href="/profile")
                        i.fas.fa-user
                    a(href="/logout")
                        i.fas.fa-sign-out-alt
                .mainSectionContainer.col-10.col-md-8.col-lg-6
                    .titleContainer
                        h1 #{pageTitle}

                    block content

                .d-none.d-md-block.col-md-2.col-lg-4

        script(src='https://kit.fontawesome.com/85404227e2.js' crossorigin='anonymous')
        script(src='https://code.jquery.com/jquery-3.5.1.min.js', integrity='sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=', crossorigin='anonymous')
        script(src='https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js', integrity='sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo', crossorigin='anonymous')
        script(src='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js', integrity='sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6', crossorigin='anonymous')

        block scripts

        script(src="/js/common.js")

$("#postTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();
    
    var submitButton = $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton").click(() => {
    var button = $(event.target);
    var textbox = $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    $.post("/api/posts", data, postData => {
        
        var html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val("");
        button.prop("disabled", true);
    })
})

$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }

        }
    })

})

$(document).on("click", ".retweetButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {            
            button.find("span").text(postData.retweetUsers.length || "");

            if(postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }

        }
    })

})

function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData) {

    if(postData == null) return alert("post object is null");

    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    console.log(isRetweet);
    
    var postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";

    var retweetText = '';
    if(isRetweet) {
        retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`
    }

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}


:root {
    --blue: #1FA2F1;
    --blueLight: #9BD1F9;
    --buttonHoverBg: #d4edff;
    --lightGrey: rgb(230, 236, 240);
    --spacing: 15px;
    --greyText: rgb(101, 119, 134);
    --greyButtonText: rgba(0,0,0,0.34);
    --red: rgb(226,34,94);
    --redBackground: rgba(226,34,94,0.1);
    --green: rgb(23,191,99);
    --greenBackground: rgba(23,191,99,0.1)
}

* {
    outline: none !important;
}

a {
    color: inherit;
}

a:hover {
    color: inherit;
    text-decoration: none;
}

h1 {
    font-size: 19px;
    font-weight: 800;
    margin: 0;
}

nav {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    height: 100%;
}

nav a {
    padding: 10px;
    font-size: 30px;
    width: 55px;
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #212529;
}

nav a.blue {
    color: var(--blue);
}

nav a:hover {
    background-color: var(--buttonHoverBg);
    color: var(--blue);
    border-radius: 50%;
}

button {
    background-color: transparent;
    border: none;
    color: var(--greyButtonText);
}

button i,
button span {
    pointer-events: none;
}

.mainSectionContainer {
    padding:  0;
    border-left: 1px solid var(--lightGrey);
    border-right: 1px solid var(--lightGrey);
    display: flex;
    flex-direction: column;
}

.titleContainer {
    height: 53px;
    padding: 0 var(--spacing);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--lightGrey);
    flex-shrink: 0;
}

.titleContainer h1 {
    flex: 1;
}

.postFormContainer {
    display: flex;
    padding: var(--spacing);
    border-bottom: 10px solid rgb(230, 236, 240);
    flex-shrink: 0;
}

.userImageContainer {
    width: 50px;
    height: 50px;
}

.userImageContainer img {
    width: 100%;
    border-radius: 50%;
    background-color: white;
}

.textareaContainer {
    flex: 1;
    padding-left: var(--spacing);
}

.textareaContainer textarea {
    width: 100%;
    border: none;
    resize: none;
    font-size: 19px;
}

#submitPostButton {
    background-color: var(--blue);
    color: white;
    border: none;
    border-radius: 40px;
    padding: 7px 15px;
}

#submitPostButton:disabled {
    background-color: var(--blueLight);
}

.post {
    display: flex;
    flex-direction: column;
    padding: var(--spacing);
    cursor: pointer;
    border-bottom: 1px solid var(--lightGrey);
    flex-shrink: 0;
}

.mainContentContainer {
    flex: 1;
    display: flex;
}

.postContentContainer {
    padding-left: var(--spacing);
    display: flex;
    flex-direction: column;
    flex: 1;
}

.username,
.date {
    color: var(--greyText)
}

.displayName {
    font-weight: bold;
}

.postFooter {
    display: flex;
    align-items: center;
}

.postFooter .postButtonContainer {
    flex: 1;
    display: flex;
}

.postFooter .postButtonContainer button {
    padding: 2px 5px;
}

.header a:hover {
    text-decoration: underline;
}

.header a,
.header span {
    padding-right: 5px;
}

.postButtonContainer button:hover {
    background-color: #d4edff;
    color: var(--blue);
    border-radius: 50%;
}

.postButtonContainer.red button.active {
    color: var(--red);
}

.postButtonContainer.red button:hover {
    color: var(--red);
    background-color: var(--redBackground);
}

.postButtonContainer.green button.active {
    color: var(--green);
}

.postButtonContainer.green button:hover {
    color: var(--green);
     background-color: var(--greenBackground);      
}

.postActionContainer {
    padding-left: 35px;
    font-size: 13px;
    color: var(--greyText);
    margin-bottom: 5px;
}


$(document).ready(() => {
    $.get("/api/posts", results => {
        outputPosts(results, $(".postsContainer"));
    })
})

function outputPosts(results, container) {
    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}


const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    Post.find()
    .populate("postedBy")
    .populate("retweetData")
    .sort({ "createdAt": -1 })
    .then(async results => {
        results = await User.populate(results, { path: "retweetData.postedBy" });
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.post("/", async (req, res, next) => {

    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: "postedBy" })

        res.status(201).send(newPost);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.put("/:id/like", async (req, res, next) => {

    var postId = req.params.id;
    var userId = req.session.user._id;

    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    var option = isLiked ? "$pull" : "$addToSet";

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send(post)
})

router.post("/:id/retweet", async (req, res, next) => {
    var postId = req.params.id;
    var userId = req.session.user._id;

    // Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = deletedPost != null ? "$pull" : "$addToSet";

    var repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    // Insert post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    res.status(200).send(post)
})

module.exports = router;


extends layouts/login-layout.pug

block content
    .loginContainer
        h1 Login
        form(method="post")

            p.errorMessage #{errorMessage}

            input(type="text", name="logUsername", placeholder="Username or email", value=logUsername required="")
            input(type="password", name="logPassword", placeholder="Password", required="")
            input(type="submit", value="Login")
        a(href="/register") Need an account? Register here.
        
        
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetData: { type: Schema.Types.ObjectId, ref: 'Post' }
}, { timestamps: true });

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;


const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

var User = mongoose.model('User', UserSchema);
module.exports = User;


// Ended at 3:59 6-7-2022
