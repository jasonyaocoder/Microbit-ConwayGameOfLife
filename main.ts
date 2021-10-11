let pixelGridOffset = 0
let startNewGeneration = 0
let requestingStart = 0
let newPixelGrid: number[] = []
let currentPixelGrid: number[] = []
let index = 0
let xOffset = 0
let yOffset = 0
let friendAliveCount = 0
let aCount = 0
let startingLifeID = 0
let aliveNeighbourCount = 0
let effectiveOffset = 0
let generations = 0
function isAlive (PixelGrid: any[], x: number, y: number) {
    pixelGridOffset = arrayOffset(x, y)
    if (0 <= pixelGridOffset && 24 >= pixelGridOffset) {
        return PixelGrid[pixelGridOffset]
    }
    return 0
}
input.onButtonPressed(Button.A, function () {
    startNewGeneration = 1
    requestingStart = 1
})
function calculateNextGeneration (pixelGrid: any[]) {
    newPixelGrid = []
    for (let yOffset = 0; yOffset <= 4; yOffset++) {
        for (let xOffset = 0; xOffset <= 4; xOffset++) {
            newPixelGrid[arrayOffset(xOffset, yOffset)] = shouldBeAlive(pixelGrid, xOffset, yOffset)
        }
    }
    return newPixelGrid
}
function draw (pixelGrid: any[]) {
    for (let yOffset = 0; yOffset <= 4; yOffset++) {
        for (let xOffset = 0; xOffset <= 4; xOffset++) {
            if (1 == isAlive(pixelGrid, xOffset, yOffset)) {
                led.plot(xOffset, yOffset)
            } else {
                led.unplot(xOffset, yOffset)
            }
        }
    }
    music.playTone(262, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
}
function gridFromPlot () {
    currentPixelGrid = []
    for (let yOffset = 0; yOffset <= 4; yOffset++) {
        for (let xOffset = 0; xOffset <= 4; xOffset++) {
            index = arrayOffset(xOffset, yOffset)
            if (led.point(xOffset, yOffset)) {
                currentPixelGrid[index] = 1
            } else {
                currentPixelGrid[index] = 0
            }
        }
    }
    return currentPixelGrid
}
function testDebugging () {
    xOffset = 2
    yOffset = 3
}
function shouldBeAlive (pixelGrid: any[], x: number, y: number) {
    friendAliveCount = getAliveNeighbourCount(pixelGrid, x, y)
    if (1 == isAlive(pixelGrid, x, y)) {
        if (friendAliveCount == 2 || friendAliveCount == 3) {
            return 1
        } else {
            return 0
        }
    } else {
        if (friendAliveCount == 3) {
            return 1
        }
    }
    return 0
}
function aliveCount (pixelGrid: any[]) {
    aCount = 0
    for (let index = 0; index <= 24; index++) {
        aCount += pixelGrid[index]
    }
    return aCount
}
function startingLife () {
    if (startNewGeneration == 1) {
        startingLifeID = randint(0, 7)
        if (startingLifeID == 0) {
            basic.showIcon(IconNames.Duck)
        } else if (startingLifeID == 1) {
            basic.showIcon(IconNames.Tortoise)
        } else if (startingLifeID == 2) {
            basic.showIcon(IconNames.Triangle)
        } else if (startingLifeID == 3) {
            basic.showIcon(IconNames.Chessboard)
        } else if (startingLifeID == 4) {
            basic.showIcon(IconNames.Diamond)
        } else if (startingLifeID == 5) {
            basic.showLeds(`
                # . . # #
                # . # . #
                . # # # .
                # . . . #
                # . # . #
                `)
        } else {
            basic.showIcon(IconNames.Giraffe)
        }
    } else {
        currentPixelGrid = newRandomGrid()
        draw(currentPixelGrid)
    }
}
function getAliveNeighbourCount (pixelGrid: any[], x: number, y: number) {
    aliveNeighbourCount = 0
    aliveNeighbourCount += isAlive(pixelGrid, x + -1, y + -1)
    aliveNeighbourCount += isAlive(pixelGrid, x + 0, y + -1)
    aliveNeighbourCount += isAlive(pixelGrid, x + 1, y + -1)
    aliveNeighbourCount += isAlive(pixelGrid, x + -1, y + 0)
    aliveNeighbourCount += isAlive(pixelGrid, x + 1, y + 0)
    aliveNeighbourCount += isAlive(pixelGrid, x + -1, y + 1)
    aliveNeighbourCount += isAlive(pixelGrid, x + 0, y + 1)
    aliveNeighbourCount += isAlive(pixelGrid, x + 1, y + 1)
    return aliveNeighbourCount
}
function arrayOffset (x: number, y: number) {
    if (0 > x || 24 < x) {
        return -1
    }
    if (0 > y || 24 < y) {
        return -1
    }
    return safeOffset(x) + 5 * safeOffset(y)
}
function newRandomGrid () {
    currentPixelGrid = []
    for (let index = 0; index <= 24; index++) {
        currentPixelGrid[index] = randomLife()
    }
    return currentPixelGrid
}
input.onButtonPressed(Button.B, function () {
    startNewGeneration = 2
    requestingStart = 1
})
function safeOffset (num: number) {
    effectiveOffset = num % 5
    if (effectiveOffset < 0) {
        effectiveOffset = 5 + effectiveOffset
    }
    return effectiveOffset
}
function randomLife () {
    if (randint(0, 10) > 5) {
        return 1
    }
    return 0
}
basic.forever(function () {
    startingLife()
    currentPixelGrid = gridFromPlot()
    soundExpression.soaring.play()
    draw(currentPixelGrid)
    testDebugging()
    generations = 0
    startNewGeneration = 0
    requestingStart = 0
    while (0 < aliveCount(currentPixelGrid) && requestingStart == 0) {
        currentPixelGrid = calculateNextGeneration(currentPixelGrid)
        draw(currentPixelGrid)
        generations += 1
    }
    draw(currentPixelGrid)
    basic.showNumber(generations)
    if (0 < aliveCount(currentPixelGrid)) {
        soundExpression.hello.play()
        basic.showIcon(IconNames.Happy)
    } else {
        soundExpression.sad.play()
        basic.showIcon(IconNames.Skull)
        control.waitForEvent(requestingStart, 1)
        control.waitMicros(1000)
    }
})
