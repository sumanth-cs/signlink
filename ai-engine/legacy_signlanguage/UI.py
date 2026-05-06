import warnings
warnings.filterwarnings('ignore') # suppress import warnings
import PIL.Image
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS
import cv2
import numpy as np
import math

import os
from tkinter import filedialog
import tkinter.messagebox
import numpy as np
import cv2
from matplotlib import pyplot as plt
from tkinter import *
from tkinter import ttk
import numpy as np
import tensorflow as tf
from random import shuffle
from tqdm import tqdm 
from tflearn.layers.conv import conv_2d, max_pool_2d
from tflearn.layers.core import input_data, dropout, fully_connected
from tflearn.layers.estimator import regression
import tflearn
import pyttsx3

from PIL import ImageTk,Image

imgfile=''
testfolder='gestures'
trainfolder='gestures'

def SpeakText(command):
  engine = pyttsx3.init()
  if engine._inLoop:
    engine.endLoop()
        
  engine.say(command)
  engine.runAndWait()


def nothing(x):
    pass





def browsefunc():
    image_x, image_y = 64,64
    data=''
    cam = cv2.VideoCapture(0)


    cv2.namedWindow("Trackbars")
    cv2.resizeWindow("Trackbars",300,400)

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
    SpeakText("Your Gesture is : "+img_text)
    return


def browsefunc_char():
    os.system("python3.8 final_pred.py")
    return




def browsefunc_char2():
    from keras.models import load_model
    classifier = load_model('Trained_model.h5')
    image_x, image_y = 64,64
    data=''
    cam = cv2.VideoCapture(0)


    cv2.namedWindow("Trackbars")
    cv2.resizeWindow("Trackbars",300,400)

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
            img_text = predictor_char2()
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            if cv2.waitKey(1) == 27:
                break
        except Exception as e:
            print(e)
            print('Processed')
            break
    SpeakText(img_text)
    return

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
       


def predictor_char():    
    import numpy as np
    from keras_preprocessing import image
    from keras.models import load_model

    classifier = load_model('Trained_model.h5')
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
          return 'F'
    elif result[0][6] == 1:
          return 'G'
    elif result[0][7] == 1:
          return 'H'
    elif result[0][8] == 1:
          return 'I'
    elif result[0][9] == 1:
          return 'J'
    elif result[0][10] == 1:
          return 'K'
    elif result[0][11] == 1:
          return 'L'
    elif result[0][12] == 1:
          return 'M'
    elif result[0][13] == 1:
          return 'N'
    elif result[0][14] == 1:
          return 'O'
    elif result[0][15] == 1:
          return 'P'
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
          return 'V'
    elif result[0][22] == 1:
          return 'W'
    elif result[0][23] == 1:
          return 'X'
    elif result[0][24] == 1:
          return 'Y'
    elif result[0][25] == 1:
          return 'Z'





def predictor_char2():    
    import numpy as np
    from keras_preprocessing import image
    from keras.models import load_model

    classifier = load_model('Trained_model.h5')
    test_image = image.load_img('1.png', target_size=(64, 64))
    test_image = image.img_to_array(test_image)
    test_image = np.expand_dims(test_image, axis = 0)
    result = classifier.predict(test_image)

    if result[0][0] == 1:
          return 'Not Recognized'
    elif result[0][1] == 1:
          return 'Not Recognized'
    elif result[0][2] == 1:
          return 'STAND'
    elif result[0][3] == 1:
          return 'Not Recognized'
    elif result[0][4] == 1:
          return 'Not Recognized'
    elif result[0][5] == 1:
          return 'HOME'
    elif result[0][6] == 1:
          return 'Not Recognized'
    elif result[0][7] == 1:
          return 'Not Recognized'
    elif result[0][8] == 1:
          return 'Not Recognized'
    elif result[0][9] == 1:
          return 'Not Recognized'



TRAIN_DIR = 'gestures'
TEST_DIR = 'gestures'
IMG_SIZE = 50
LR = 1e-3
MODEL_NAME = 'dwij28leafdiseasedetection-{}-{}.model'.format(LR, '2conv-basic')
#tf.logging.set_verbosity(tf.logging.ERROR) # suppress keep_dims warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' # suppress tensorflow gpu logs
#tf.reset_default_graph()

''' </global actions> '''

def label_leaves(leaf):

    leaftype = leaf[0]
    ans = [0,0,0,0]

    if leaftype == 'h': ans = [1,0,0,0]
    elif leaftype == 'b': ans = [0,1,0,0]
    elif leaftype == 'v': ans = [0,0,1,0]
    elif leaftype == 'l': ans = [0,0,0,1]

    return ans

def create_training_data():

    training_data = []

    for img in tqdm(os.listdir(TRAIN_DIR)):
        label = label_leaves(img)
        path = imgfile
        img = cv2.imread(path,cv2.IMREAD_COLOR)
        img = cv2.resize(img, (IMG_SIZE,IMG_SIZE))
        training_data.append([np.array(img),np.array(label)])

    shuffle(training_data)
    np.save('train_data.npy', training_data)

    return training_data

    

def loadmodel():
    print('python ./ObjectCode/ssd_video.py --input videos --output output/video_output.avi --ssd ssd --ipimage images/r1.jpeg')
    os.system('python3.8 ./ObjectCode/ssd_video.py --input videos --output output/video_output.avi --ssd ssd --ipimage images/r1.jpeg')

def loadmodel1():
    return "a"
    

def compute_euclidean_distance(point, centroid):
    return np.sqrt(np.sum((point - centroid)**2))

def assign_label_cluster(distance, data_point, centroids):
    index_of_minimum = min(distance, key=distance.get)
    return [index_of_minimum, data_point, centroids[index_of_minimum]]

def compute_new_centroids(cluster_label, centroids):
    return np.array(cluster_label + centroids)/2

def iterate_k_means(data_points, centroids, total_iteration):
    label = []
    cluster_label = []
    total_points = len(data_points)
    k = len(centroids)
    
    for iteration in range(0, total_iteration):
        for index_point in range(0, total_points):
            distance = {}
            for index_centroid in range(0, k):
                distance[index_centroid] = compute_euclidean_distance(data_points[index_point], centroids[index_centroid])
            label = assign_label_cluster(distance, data_points[index_point], centroids)
            centroids[label[0]] = compute_new_centroids(label[1], centroids[label[0]])

            if iteration == (total_iteration - 1):
                cluster_label.append(label)

    return [cluster_label, centroids]

def print_label_data(result):
    print("Result of k-Means Clustering: \n")
    for data in result[0]:
        print("data point: {}".format(data[1]))
        print("cluster number: {} \n".format(data[0]))
    print("Last centroids position: \n {}".format(result[1]))

def create_centroids():
    centroids = []
    centroids.append([5.0, 0.0])
    centroids.append([45.0, 70.0])
    centroids.append([50.0, 90.0])
    return np.array(centroids)

    
    

def ShowImage(title,img,ctype):
  plt.figure(figsize=(10, 10))
  if ctype=='bgr':
    b,g,r = cv2.split(img)       # get b,g,r
    rgb_img = cv2.merge([r,g,b])     # switch it to rgb
    plt.imshow(rgb_img)
  elif ctype=='hsv':
    rgb = cv2.cvtColor(img,cv2.COLOR_HSV2RGB)
    plt.imshow(rgb)
  elif ctype=='gray':
    plt.imshow(img,cmap='gray')
  elif ctype=='rgb':
    plt.imshow(img)
  else:
    raise Exception("Unknown colour type")
  plt.axis('off')
  plt.title(title)
  plt.show()


def main():
    print('Started')
    window = Tk()
    window.title("Image Processing Page")
    window.geometry('800x450')
    imgfile=''
    img=ImageTk.PhotoImage(Image.open("a.jpg"))
    l=Label(image=img)
    l.pack()
    a = Button(text="Number Gesture", height=2, width=40 , command=browsefunc)
    b = Button(text="Character Gesture", height=2, width=40,command=browsefunc_char)
    print(imgfile)
    a.place(relx=0.30, rely=0.30, anchor=CENTER)
    b.place(relx=0.70, rely=0.30, anchor=CENTER)
    window.mainloop()

if __name__ == '__main__': main()
