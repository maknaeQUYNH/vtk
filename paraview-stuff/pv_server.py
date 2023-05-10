// @author Jakob Patterson and Thomas Huynh
import os
import argparse

from paraview.web import pv_wslink
from paraview.web import protocols as pv_protocols

from paraview import servermanager, simple
from wslink import server
from paraview.simple import *

// This connects the paraview server which is downloaded on our server and connects it to our Senior Design website
connection = servermanager.Connect('coms-402-sd-07.class.las.iastate.edu')

reader = OpenDataFile('../../BoemerJetCase3/BoemerJetCase3/case.foam')


// Currently trying this bit of code, which is supposed to take in an open foam file, and then read the file and display the files contents
// on our website, currently not working.

>>> servermanager.LoadState("../../BoemerJetCase3/BoemerJetCase3/case.foam")
# Use the utility method to get the first render view. We could have
# looked in the “views” group instead.
>>> view = servermanager.GetRenderView()
# Render the scene
>>> view.StillRender()

// Still can't quite get the code above to work, currently trying these two lines of code to try and get the paraview server to read a file and send the data back.

// With this code running into two errors, one being that it cannot open or read the case.foam file, the other is with the vtkoutputwindow, assuming that since it cannot read the file there is nothing to output.

reader = ExodusIIReader(FileName=“../../BoemerJetCase3/BoemerJetCase3/case.foam”)

reader = OpenDataFile(“../../BoemerJetCase3/BoemerJetCase3/case.foam”)
