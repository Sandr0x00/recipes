from PIL import Image

im = Image.open("../pixelart.png")
pix = im.load()
width, height = im.size

sz = 18

minx = 2
miny = 1

image_names = [
    "pot",
    "wineglas",
    "old-fashioned",
    "longdrink",
    "wok",
    "pan",
    "bbq",
    "oven",
    "tomato",
    "hurricane",
    "chocolate",
    "avocado",
    "onion",
    "russia",
    "potato",
    "chicken",
    "meat"
]
images = []
import numpy as np

def check_x_dir(pix, x, y):
    p = pix[x, y]
    xi = 1
    for xi in range(1, sz - x):
        pi = pix[x + xi, y]
        if pi != p:
            break
    return xi

def check_y_dir(pix, x, y):
    p = pix[x, y]
    yi = 1
    for yi in range(1, sz - y):
        pi = pix[x, y + yi]
        if pi != p:
            break
    return yi


def create_svg(im):
    pix = im.load()
    matrix = np.zeros((sz, sz), dtype=int)

    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" shape-rendering="crispEdges">'

    colors = {}
    for y in range(sz):
        for x in range(sz):
            # skip already visited
            if matrix[x, y] == 1:
                continue
            # skip edges
            if x == 0 and y == 0:
                continue
            if x == 0 and y == 17:
                continue
            if x == 17 and y == 0:
                continue
            if x == 17 and y == 17:
                continue

            if x == 0 or x == 17:
                continue
            if y == 0 or y == 17:
                continue

            p = pix[x, y]

            if p[3] == 0:
                continue

            xi = 1
            yi = 1
            if check_x_dir(pix, x, y) >= check_y_dir(pix, x, y):
                for xi in range(1, 18 - x):
                    pi = pix[x + xi, y]
                    # print(p, pi)
                    if pi != p:
                        break
                    matrix[x + xi, y] = 1
            else:
                for yi in range(1, 18 - y):
                    pi = pix[x, y + yi]
                    # print(p, pi)
                    if pi != p:
                        break
                    matrix[x, y + yi] = 1

            # print(xi, yi)
            r,g,b,_ = p
            # print(r,g,b,a)
            # if a == 255:
            r = f"{r:02x}"
            g = f"{g:02x}"
            b = f"{b:02x}"
            if r[0] == r[1] and g[0] == g[1] and b[0] == b[1]:
                color = f"{r[0]}{g[0]}{b[0]}"
            else:
                color = f"{r}{g}{b}"
            if color not in colors:
                colors[color] = []
            colors[color].append(f'<rect x="{x}" y="{y}" width="{xi}" height="{yi}"/>')
    for c,rects in colors.items():
        svg += f'<g fill="#{c}">'
        for r in rects:
            svg += r
        svg += "</g>"
    svg += "</svg>"
    return svg

def find_image(startx, starty):
    for x in range(16):
        if pix[startx + x, starty] != (0,0,0,255):
            return False
        if pix[startx + x, starty + 17] != (0,0,0,255):
            return False
    startx -= 1
    starty += 1
    for y in range(16):
        if pix[startx, starty + y] != (0,0,0,255):
            return False
        if pix[startx + 17, starty + y] != (0,0,0,255):
            return False
    return True

# find images
for y in range(height):
    for x in range(width):
        if pix[x,y] == (0,0,0,255):
            # we found some black thingy, see if we have an image
            if find_image(x,y):
                area = (x - 1, y, x + 17, y + 18)
                cropped = im.crop(area)
                images.append(cropped)

# print(images)

if len(image_names) != len(images):
    print("Length should be equal")
    exit()

for i in range(len(images)):
    svg = create_svg(images[i])
    with open(f"../public/icons/{image_names[i]}.svg", "w+") as f:
        f.write(svg)


# exit()


