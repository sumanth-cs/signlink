import cv2
import numpy as np
import math

def nothing(x):
    pass

image_x, image_y = 64,64
data=''

from keras.models import load_model
classifier = load_model('Trained_model.h5')

def predictor():
    
    hand = cv2.imread("1.png",0)
    print('aaa')

    # Apply Gaussian blur
    blur = cv2.GaussianBlur(hand, (7, 7), 0)

    # # Apply Threshold
    ret, thresh = cv2.threshold(blur, 127, 255, 0)
    
    # Find contours
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2:]
    #contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    try:
        # Find contour with maximum area
        contour = max(contours, key=lambda x: cv2.contourArea(x))

        # Create bounding rectangle around the contour
        x, y, w, h = cv2.boundingRect(contour)
        cv2.rectangle(hand, (x, y), (x + w, y + h), (0, 0, 255), 0)

        # Find convex hull
        hull = cv2.convexHull(contour)

        # Draw contour
        drawing = np.zeros(hand.shape, np.uint8)
        cv2.drawContours(drawing, [contour], -1, (0, 255, 0), 0)
        cv2.drawContours(drawing, [hull], -1, (0, 0, 255), 0)

        # Find convexity defects
        hull = cv2.convexHull(contour, returnPoints=False)
        defects = cv2.convexityDefects(contour, hull)

        # Use cosine rule to find angle of the far point from the start and end point i.e. the convex points (the finger
        # tips) for all defects
        count_defects = 0

        for i in range(defects.shape[0]):
            s, e, f, d = defects[i, 0]
            start = tuple(contour[s][0])
            end = tuple(contour[e][0])
            far = tuple(contour[f][0])

            a = math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2)
            b = math.sqrt((far[0] - start[0]) ** 2 + (far[1] - start[1]) ** 2)
            c = math.sqrt((end[0] - far[0]) ** 2 + (end[1] - far[1]) ** 2)
            angle = (math.acos((b ** 2 + c ** 2 - a ** 2) / (2 * b * c)) * 180) / 3.14

            # if angle > 90 draw a circle at the far point
            if angle <= 90:
                count_defects += 1
                cv2.circle(hand, far, 1, [0, 0, 255], -1)

            cv2.line(hand, start, end, [0, 255, 0], 2)

        # Print number of fingers
        print(count_defects)
        if count_defects == 0:
            return "ONE"
        elif count_defects == 1:
            return "TWO"
        elif count_defects == 2:
            return "THREE"
        elif count_defects == 3:
            return "FOUR"
        elif count_defects == 4:
            return "FIVE"
        else:
            return "Five"
    except Exception as e:
        print(e)
        return "Unable to recognize"
    '''
       import numpy as np
       from keras_preprocessing import image
       test_image = image.load_img('1.png', target_size=(64, 64))
       test_image = image.img_to_array(test_image)
       test_image = np.expand_dims(test_image, axis = 0)
       result = classifier.predict(test_image)
       
       if result[0][0] == 1:
              return 'A'
       elif result[0][1] == 1:
              return 'B'
       elif result[0][2] == 1:
              return 'C'
       elif result[0][3] == 1:
              return 'D'
       elif result[0][4] == 1:
              return 'E'
       elif result[0][5] == 1:
              return 'THREE'
       elif result[0][6] == 1:
              return 'ONE'
       elif result[0][7] == 1:
              return 'H'
       elif result[0][8] == 1:
              return 'I'
       elif result[0][9] == 1:
              return 'J'
       elif result[0][10] == 1:
              return 'K'
       elif result[0][11] == 1:
              return 'ONE'
       elif result[0][12] == 1:
              return 'M'
       elif result[0][13] == 1:
              return 'N'
       elif result[0][14] == 1:
              return 'TWO'
       elif result[0][15] == 1:
              return 'ONE'
       elif result[0][16] == 1:
              return 'Q'
       elif result[0][17] == 1:
              return 'R'
       elif result[0][18] == 1:
              return 'S'
       elif result[0][19] == 1:
              return 'T'
       elif result[0][20] == 1:
              return 'U'
       elif result[0][21] == 1:
              return 'TWO'
       elif result[0][22] == 1:
              return 'THREE'
       elif result[0][23] == 1:
              return 'X'
       elif result[0][24] == 1:
              return 'TWO'
       elif result[0][25] == 1:
              return 'Z'
    '''
       



cam = cv2.VideoCapture(0)


cv2.namedWindow("Trackbars")

cv2.createTrackbar("L - H", "Trackbars", 0, 179, nothing)
cv2.createTrackbar("L - S", "Trackbars", 0, 255, nothing)
cv2.createTrackbar("L - V", "Trackbars", 0, 255, nothing)
cv2.createTrackbar("U - H", "Trackbars", 179, 179, nothing)
cv2.createTrackbar("U - S", "Trackbars", 204, 255, nothing)
cv2.createTrackbar("U - V", "Trackbars", 204, 255, nothing)



img_counter = 0

img_text = ''
while True:
    try:
        ret, frame = cam.read()
        frame = cv2.flip(frame,1)
        l_h = cv2.getTrackbarPos("L - H", "Trackbars")
        l_s = cv2.getTrackbarPos("L - S", "Trackbars")
        l_v = cv2.getTrackbarPos("L - V", "Trackbars")
        u_h = cv2.getTrackbarPos("U - H", "Trackbars")
        u_s = cv2.getTrackbarPos("U - S", "Trackbars")
        u_v = cv2.getTrackbarPos("U - V", "Trackbars")
        h,w,c=frame.shape
        startx=w/2
        y=0
        #cframe = frame[int(y):int(y+h), int(startx):int(startx+w)]


        img = cv2.rectangle(frame, (300,100),(600,400), (0,255,0), thickness=2, lineType=8, shift=0)

        lower_blue = np.array([l_h, l_s, l_v])
        upper_blue = np.array([u_h, u_s, u_v])
        imcrop = img[100:400, 300:600]
        hsv = cv2.cvtColor(imcrop, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, lower_blue, upper_blue)
        
        cv2.putText(frame, img_text, (30, 400), cv2.FONT_HERSHEY_TRIPLEX, 1.5, (0, 255, 0))
        data=data+str(img_text)
        cv2.imshow("Sign Language Reader", img)
        cv2.imshow("Boyka Thresholder", mask)
        
        #if cv2.waitKey(1) == ord('c'):
            
        img_name = "1.png"
        save_img = cv2.resize(mask, (image_x, image_y))
        cv2.imwrite(img_name, save_img)
        img_text = predictor()
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        if cv2.waitKey(1) == 27:
            break
    except Exception as e:
        print(e)
        print('Processed')
        break

def split(word): 
    return [char for char in word]

def unique(list1): 
    x = np.array(list1)
    print(np.unique(x))
    return list(np.unique(x)) 
'''
finalop=''
print(data)
datalist=split(data)
datalist=unique(datalist)
print(datalist)
counter=0
for i in range(len(datalist)):    
    for j in range(len(dataval)):
        counter=0
        for k in range(len(dataval[j])):
            print(datalist[i])
            print(dataval[j][k])
            if(datalist[i]==dataval[j][k]):
                counter+=1
        vals=0
        if(len(data)>3):
            vals=len(data)-2
        else:
            vals=len(data)
        if(counter>=3):
            finalop=dataval[j]
        
print(finalop)
fnsd='D:\\Project\\Video Sign Language\\output.txt'

'''

'''

finval=img_text
import mysql.connector
from mysql.connector import Error

#connection = MySQLdb.connect(host="sg2nlmysql15plsk.secureserver.net",user="intrellaroot",passwd="intrella@696",db="iotdb")

#1 - Buzzer
#2-Dc Motor
#3-fan
#4-light
#5 Door Lock
connection = mysql.connector.connect(host='sg2nlmysql15plsk.secureserver.net',database='iotdb',user='intrellaroot',password='intrella@696', port=3306)
cursor = connection.cursor()
print(finval)
buzz=0
pump=0
fan=0
door=0
light=0
sq_query="select * from gesture"
cursor.execute(sq_query)
data=cursor.fetchall()
buzz=int(data[0][5])
pump=int(data[0][4])
fan=int(data[0][3])
door=int(data[0][2])
light=int(data[0][1])

sq_query=''
if finval=="ONE":
    if buzz==0:
        sq_query='Update gesture set buzz=1'
    elif buzz==1:
        sq_query='Update gesture set buzz=0'
        
elif finval=="TWO":
    if pump==0:
        sq_query='Update gesture set pump=1'
    elif pump==1:
        sq_query='Update gesture set pump=0'
elif finval=="THREE":
    if fan==0:
        sq_query='Update gesture set fan=1'
    elif fan==1:
        sq_query='Update gesture set fan=0'
elif finval=="FOUR":
    if light==0:
        light='Update gesture set light=1'
    elif light==1:
        sq_query='Update gesture set light=0'
elif finval=="FIVE":
    if door==0:
        sq_query='Update gesture set door=1'
    elif door==1:
        sq_query='Update gesture set door=0'
print(sq_query)
cursor.execute(sq_query)
connection.commit()
connection.close()
cursor.close()
connection.close()
'''

cam.release()
cv2.destroyAllWindows()
