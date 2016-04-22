function numberPlateExtraction
imagefiles = dir('./example/*.jpg');      
nfiles = length(imagefiles);    % Number of files found

for ii=1:nfiles
currentfilename = imagefiles(ii).name;
filename=strcat('./example/', currentfilename);
currentimage = imread(filename);
images{ii} = currentimage;
f=images{ii};
f=imresize(f,[400 NaN]);
g=rgb2gray(f);
g=medfilt2(g,[3 3]);
se=strel('disk',1);
gi=imdilate(g,se);
ge=imerode(g,se);
gdiff=imsubtract(gi,ge);
gdiff=mat2gray(gdiff);
gdiff=conv2(gdiff,[1 1;1 1]);
gdiff=imadjust(gdiff,[0.5 0.7],[0 1],0.1);
B=logical(gdiff);
er=imerode(B,strel('line',50,0));
out1=imsubtract(B,er);
F=imfill(out1,'holes');
H=bwmorph(F,'thin',1);
H=imerode(H,strel('line',3,90));
final=bwareaopen(H,100);
Iprops=regionprops(final,'BoundingBox','Image');
NR=cat(1,Iprops.BoundingBox);
r=controlling(NR);
if ~isempty(r)
I={Iprops.Image};
noPlate=[];
for v=1:length(r)
N=I{1,r(v)};
letter=readLetter(N);
while letter=='O' || letter=='0'
if v<=3
letter='O';
else
letter='0';
end
break;
end
noPlate=[noPlate letter];
end
fid = fopen('../car_server/numberPlate.txt','w');
fprintf(fid,'\n%s \n\r',noPlate);
fclose(fid);
winopen('../car_server/numberPlate.txt')
else
fprintf('Unable to extract the characters from the number plate.\n');
fprintf('The characters on the number plate might not be clear or touching with each other or boundries.\n');
end
pause(15);
end
end