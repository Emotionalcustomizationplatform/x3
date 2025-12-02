// 1. 数据定义
const carouselSlides = [
    {
        title: "Feast of Color",
        image: "/carousel/slide-img-1.jpg",
    },
    {
        title: "The Matador",
        image: "/carousel/slide-img-2.jpg",
    },
    {
        title: "Final Plea",
        image: "/carousel/slide-img-3.jpg",
    },
    {
        title: "Old Philosopher",
        image: "/carousel/slide-img-4.jpg",
    },
    {
        title: "Evening Waltz",
        image: "/carousel/slide-img-5.jpg",
    },
];

// 2. 全局变量
let carousel, carouselImages, prevBtn, nextBtn; 

let currentIndex = 0; 
let carouselTextElements = []; 
let splitTextInstances = []; 
let isAnimating = false; 

// 3. 自定义缓动函数
CustomEase.create(
    "hop", 
    "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1" 
);

// 4. 初始化函数
function initCarousel() { 
    // 获取 DOM 元素
    carousel = document.querySelector(".carousel"); 
    carouselImages = document.querySelector(".carousel-images"); 
    prevBtn = document.querySelector(".prev-btn"); 
    nextBtn = document.querySelector(".next-btn"); 

    createCarouselTitles();
    createInitialSlide();
    bindCarouselControls();

    // 等待字体加载完成后执行文本相关的操作
    document.fonts.ready.then(() => { 
        // 确保 SplitText 插件已加载
        if (typeof SplitText === 'undefined') {
            console.error("GSAP SplitText plugin is not loaded.");
            return;
        }
        splitTitles();
        initFirstSlide();
    });
}

// 5. 创建所有幻灯片标题的 DOM 元素
function createCarouselTitles() { 
    carouselSlides.forEach((slide) => { 
        const slideTitleContainer = document.createElement("div"); 
        slideTitleContainer.classList.add("slide-title-container"); 

        const slideTitle = document.createElement("h1"); 
        slideTitle.classList.add("title"); 
        slideTitle.textContent = slide.title; 

        slideTitleContainer.appendChild(slideTitle); 
        carousel.appendChild(slideTitleContainer); 

        carouselTextElements.push(slideTitleContainer); 
    }); 
}

// 6. 创建初始图片幻灯片的 DOM 元素
function createInitialSlide() { 
    const initialSlideImgContainer = document.createElement("div"); 
    // 注意：这里的 .img 类是用于动画的容器
    initialSlideImgContainer.classList.add("img"); 

    const initialSlideImg = document.createElement("img"); 
    initialSlideImg.src = carouselSlides[0].image; 

    initialSlideImgContainer.appendChild(initialSlideImg); 
    carouselImages.appendChild(initialSlideImgContainer); 
}

// 7. 使用 SplitText 拆分标题为单词，以便进行动画
function splitTitles() { 
    carouselTextElements.forEach((slide) => { 
        const slideTitle = slide.querySelector(".title"); 
        const splitText = new SplitText(slideTitle, { 
            type: "words", 
            wordsClass: "word", 
        }); 
        splitTextInstances.push(splitText); 
    }); 
}

// 8. 绑定导航按钮事件监听器
function bindCarouselControls() { 
    nextBtn.addEventListener("click", () => { 
        if (isAnimating) return; 
        animateSlide("right"); 
    }); 

    prevBtn.addEventListener("click", () => { 
        if (isAnimating) return; 
        animateSlide("left"); 
    }); 
}

// 9. 初始化第一张幻灯片的文字动画（从模糊到清晰）
function initFirstSlide() { 
    // 确保除了第一个之外的所有文字都设置为初始隐藏状态
    carouselTextElements.forEach((slide, index) => {
        if (index !== 0) {
            gsap.set(slide.querySelectorAll(".word"), { opacity: 0, filter: "blur(75px)" });
        }
    });

    const initialSlideWords = carouselTextElements[0].querySelectorAll(".word"); 

    gsap.to(initialSlideWords, { 
        filter: "blur(0px)", 
        opacity: 1, 
        duration: 2, 
        ease: "power3.out",
    }); 
}

// 10. 文本切换动画（修复后的逻辑）
function updateActiveTextSlide(prevIndex) {
    // 隐藏前一个幻灯片的文字
    const prevWords = carouselTextElements[prevIndex].querySelectorAll(".word"); 

    gsap.to(prevWords, {
        opacity: 0, 
        duration: 0.5, // 快速淡出
        ease: "power1.out", 
        overwrite: true
    });

    // 显示当前幻灯片的文字（从模糊到清晰）
    const currentWords = carouselTextElements[currentIndex].querySelectorAll(".word"); 

    // 使用 fromTo 确保从初始状态 (模糊/隐藏) 开始动画
    gsap.fromTo(currentWords, 
        { filter: "blur(75px)", opacity: 0 }, // 初始状态
        {
            filter: "blur(0px)",
            opacity: 1,
            duration: 2,
            ease: "power3.out",
            overwrite: true,
        }
    );
}

// 11. 核心幻灯片切换动画
function animateSlide(direction) {
    if (isAnimating) return;
    isAnimating = true;

    const prevIndex = currentIndex; // 记录旧的索引，用于文字淡出
    
    // 更新 currentIndex
    if (direction === "right") {
        currentIndex = (currentIndex + 1) % carouselSlides.length;
    } else {
        currentIndex = (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
    }

    const viewportWidth = window.innerWidth;
    // 限制最大偏移量为 500px，或视口宽度的一半
    const slideOffset = Math.min(viewportWidth * 0.5, 500); 

    const currentSlide = carouselImages.querySelector(".img:last-child");
    const currentSlideImage = currentSlide.querySelector("img");

    // 1. 创建新幻灯片
    const newSlideImgContainer = document.createElement("div");
    newSlideImgContainer.classList.add("img");

    const newSlideImg = document.createElement("img");
    newSlideImg.src = carouselSlides[currentIndex].image;

    // 设置新图片初始位置（屏幕外侧偏移）
    gsap.set(newSlideImg, {
        x: direction === "left" ? -slideOffset : slideOffset,
    });

    newSlideImgContainer.appendChild(newSlideImg);
    carouselImages.appendChild(newSlideImgContainer);

    // 2. 动画旧图片 (推出)
    gsap.to(currentSlideImage, {
        x: direction === "left" ? slideOffset : -slideOffset,
        duration: 1.5,
        ease: "hop",
    });

    // 3. 动画新幻灯片容器 (剪裁路径展开)
    gsap.fromTo(newSlideImgContainer, {
        clipPath:
            direction === "left"
                ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" // 从右侧 100% 剪裁
                : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", // 从左侧 0% 剪裁
    }, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // 展开至 100%
        duration: 1.5,
        ease: "hop",
        onComplete: () => {
            cleanupCarouselSlides();
            isAnimating = false;
        },
    });

    // 4. 动画新图片 (移入中心)
    gsap.to(newSlideImg, {
        x: 0,
        duration: 1.5,
        ease: "hop",
    });

    // 5. 动画文字
    updateActiveTextSlide(prevIndex);
}

// 12. 清理旧幻灯片 (只保留最新的一个)
function cleanupCarouselSlides() {
    const imgElements = carouselImages.querySelectorAll(".img");
    if (imgElements.length > 1) {
        // 遍历并移除除了最后一个（当前）幻灯片之外的所有元素
        for (let i = 0; i < imgElements.length - 1; i++) {
            imgElements[i].remove();
        }
    }
}

// 13. DOM 加载完成事件监听
document.addEventListener("DOMContentLoaded", initCarousel);