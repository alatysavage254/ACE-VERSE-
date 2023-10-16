import math

x = int(input("Enter the x coordinate: "))
y = int(input("Enter the y coodinate: "))
radius = 10
# center  = (0,0)
x_difference = 0 - x
y_difference = 0 -y


sum = math.pow(x_difference,2) + math.pow(y_difference,2)
hypotenuse = math.sqrt(sum)

# calculatedRadius = math.sqrt(float(hypotenuse))

if hypotenuse <= radius:
  print("The point is inside the circle")
else:
  print("Point is outside the circle")
